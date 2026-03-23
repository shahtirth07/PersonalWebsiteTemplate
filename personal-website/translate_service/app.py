from io import BytesIO
import re

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from deep_translator import GoogleTranslator
import fitz
from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

MAX_CHARS_PER_CHUNK = 3500

app = FastAPI(title="PDF Translator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(pdf_bytes), strict=False)
    pages = []
    for page in reader.pages:
        pages.append(page.extract_text() or "")
    return "\n\n".join(pages).strip()


def split_text(text: str, max_chars: int = MAX_CHARS_PER_CHUNK) -> list[str]:
    normalized = text.replace("\r\n", "\n").strip()
    if not normalized:
        return []

    paragraphs = re.split(r"\n{2,}", normalized)
    chunks: list[str] = []
    current = ""

    for paragraph in paragraphs:
        candidate = f"{current}\n\n{paragraph}" if current else paragraph
        if len(candidate) <= max_chars:
            current = candidate
            continue

        if current:
            chunks.append(current)
            current = ""

        if len(paragraph) <= max_chars:
            current = paragraph
            continue

        for i in range(0, len(paragraph), max_chars):
            chunks.append(paragraph[i : i + max_chars])

    if current:
        chunks.append(current)

    return chunks


def translate_text(text: str) -> str:
    translator = GoogleTranslator(source="de", target="en")
    chunks = split_text(text)
    if not chunks:
        raise ValueError("No translatable text found in PDF.")

    translated_parts: list[str] = []
    for chunk in chunks:
        translated_parts.append(translator.translate(chunk))

    return "\n\n".join(part for part in translated_parts if part).strip()


def translate_text_cached(text: str, cache: dict[str, str], translator: GoogleTranslator) -> str:
    cleaned = text.strip()
    if not cleaned:
        return ""

    if cleaned in cache:
        return cache[cleaned]

    translated = translator.translate(cleaned)
    cache[cleaned] = translated
    return translated


def generate_pdf(text: str) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=40,
        bottomMargin=40,
    )
    styles = getSampleStyleSheet()
    style = styles["BodyText"]
    style.leading = 15

    story = []
    for paragraph in text.split("\n\n"):
        if paragraph.strip():
            story.append(Paragraph(paragraph.replace("\n", "<br/>"), style))
            story.append(Spacer(1, 8))

    doc.build(story)
    return buffer.getvalue()


def repair_pdf_for_processing(pdf_bytes: bytes) -> bytes:
    """
    Rebuild PDFs with broken xref/object tables so downstream processors
    (notably PyMuPDF) can read them without flooding format errors.
    """
    reader = PdfReader(BytesIO(pdf_bytes), strict=False)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    output = BytesIO()
    writer.write(output)
    return output.getvalue()


def translate_pdf_preserve_layout(pdf_bytes: bytes) -> bytes:
    """
    Keep original page geometry and non-text elements (tables, lines, images),
    and replace text blocks in-place with translated English.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    translator = GoogleTranslator(source="de", target="en")
    cache: dict[str, str] = {}

    for page in doc:
        blocks = page.get_text("dict").get("blocks", [])
        for block in blocks:
            lines = block.get("lines")
            if not lines:
                continue

            for line in lines:
                spans = line.get("spans", [])
                if not spans:
                    continue

                # Build source text per line (not whole block) to avoid table collapse.
                # Some PDFs split words into many spans; avoid injecting extra spaces.
                source_text = "".join(span.get("text", "") for span in spans).strip()
                source_text = re.sub(r"\s+", " ", source_text)
                if not source_text:
                    continue

                translated = translate_text_cached(source_text, cache, translator)
                if not translated:
                    continue

                line_rect = fitz.Rect(line["bbox"])
                if line_rect.width <= 1 or line_rect.height <= 1:
                    continue

                # Pick a close font family available in PyMuPDF.
                base_font = "helv"
                first_font_name = spans[0].get("font", "")
                if "Times" in first_font_name:
                    base_font = "times-roman"
                elif "Courier" in first_font_name:
                    base_font = "courier"

                # Keep original-ish size, then shrink to fit when translated text is longer.
                original_size = spans[0].get("size", 9.5)
                fontsize = max(6.0, min(float(original_size), 14.0))

                # Paint only the text area, then draw translated text.
                # This avoids repeated redaction rewrites that can explode PDF size.
                page.draw_rect(line_rect, color=None, fill=(1, 1, 1), overlay=True)

                inserted = page.insert_textbox(
                    line_rect,
                    translated,
                    fontsize=fontsize,
                    fontname=base_font,
                    align=fitz.TEXT_ALIGN_LEFT,
                    color=(0, 0, 0),
                )

                # If overflowed, retry with smaller font until it fits.
                if inserted < 0:
                    test_size = fontsize - 0.7
                    while test_size >= 5.0:
                        page.draw_rect(line_rect, color=None, fill=(1, 1, 1), overlay=True)
                        inserted = page.insert_textbox(
                            line_rect,
                            translated,
                            fontsize=test_size,
                            fontname=base_font,
                            align=fitz.TEXT_ALIGN_LEFT,
                            color=(0, 0, 0),
                        )
                        if inserted >= 0:
                            break
                        test_size -= 0.7

    # Compress and garbage-collect objects so output does not balloon in size.
    output_bytes = doc.tobytes(garbage=4, deflate=True, clean=True)
    doc.close()
    return output_bytes


@app.post("/translate-pdf")
async def translate_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    pdf_bytes = await file.read()
    extracted_text = extract_text_from_pdf(pdf_bytes)
    if not extracted_text:
        raise HTTPException(status_code=400, detail="No extractable text found in PDF.")

    try:
        translated_text = translate_text(extracted_text)
        translated_pdf = generate_pdf(translated_text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Translation failed: {exc}") from exc

    output_name = (file.filename or "translated.pdf").replace(".pdf", ".en.pdf")
    headers = {"Content-Disposition": f'attachment; filename="{output_name}"'}
    return StreamingResponse(BytesIO(translated_pdf), media_type="application/pdf", headers=headers)


@app.post("/translate-pdf-preserve-layout")
async def translate_pdf_with_layout(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Please upload a PDF file.")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        repaired = repair_pdf_for_processing(pdf_bytes)
        translated_pdf = translate_pdf_preserve_layout(repaired)
    except Exception as exc:
        # Fallback so user still gets a translated document when layout mode fails.
        try:
            extracted_text = extract_text_from_pdf(pdf_bytes)
            translated_text = translate_text(extracted_text)
            translated_pdf = generate_pdf(translated_text)
        except Exception as fallback_exc:
            raise HTTPException(
                status_code=500,
                detail=f"Layout-preserving translation failed: {exc}; fallback failed: {fallback_exc}",
            ) from fallback_exc

    output_name = (file.filename or "translated.pdf").replace(".pdf", ".en.layout.pdf")
    headers = {"Content-Disposition": f'attachment; filename="{output_name}"'}
    return StreamingResponse(BytesIO(translated_pdf), media_type="application/pdf", headers=headers)
