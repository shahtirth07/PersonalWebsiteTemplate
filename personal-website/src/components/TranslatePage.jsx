import React, { useMemo, useState } from 'react';
import './TranslatePage.css';

export default function TranslatePage() {
  const [file, setFile] = useState(null);
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const canTranslate = useMemo(
    () => Boolean(file && status !== 'running'),
    [file, status]
  );

  const onTranslate = async () => {
    setError('');
    setStatus('running');
    setProgress('Uploading PDF and translating...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const endpoint = preserveLayout ? '/translate-pdf-preserve-layout' : '/translate-pdf';

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let detail = 'Translation failed.';
        try {
          const data = await response.json();
          detail = data.detail || detail;
        } catch {
          // ignore parse failure
        }
        throw new Error(detail);
      }

      const blob = await response.blob();
      const baseName = file.name.replace(/\.pdf$/i, '') || 'translated';
      const suffix = preserveLayout ? '.en.layout.pdf' : '.en.pdf';
      const fileName = `${baseName}${suffix}`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setStatus('done');
      setProgress('Done. Your translated PDF download should start automatically.');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Translation failed.');
      setProgress('');
    }
  };

  return (
    <main className="translate-page">
      <div className="translate-card">
        <a href="/" className="translate-back-link">Back to portfolio</a>
        <h1>PDF Translator</h1>
        <p className="translate-subtitle">
          Upload a German PDF, translate it to English, and download an English PDF using the local Python service.
        </p>
        <p className="translate-helper">
          Start backend first: <code>uvicorn app:app --reload --port 8000</code> in <code>translate_service</code>.
        </p>
        <label className="translate-checkbox-row">
          <input
            type="checkbox"
            checked={preserveLayout}
            onChange={(e) => setPreserveLayout(e.target.checked)}
          />
          <span>Preserve original layout and tables as much as possible</span>
        </label>

        <label className="translate-label" htmlFor="pdf-file">PDF File</label>
        <input
          id="pdf-file"
          className="translate-file"
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          className="translate-btn"
          type="button"
          onClick={onTranslate}
          disabled={!canTranslate}
        >
          {status === 'running' ? 'Translating...' : 'Translate and Download PDF'}
        </button>

        {progress ? <p className="translate-status">{progress}</p> : null}
        {error ? <p className="translate-error">{error}</p> : null}
      </div>
    </main>
  );
}
