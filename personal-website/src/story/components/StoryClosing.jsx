import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { recognition, contactLinks } from '../data/story';
import './StoryClosing.css';

const EMAILJS = {
  serviceId: 'service_iwxq52i',
  templateId: 'template_omvfhla',
  publicKey: 'VbZvvR4YCnNxFoFGc',
};

const StoryClosing = () => {
  const formRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ loading: false, sent: false, error: false });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ loading: true, sent: false, error: false });

    emailjs
      .sendForm(EMAILJS.serviceId, EMAILJS.templateId, formRef.current, EMAILJS.publicKey)
      .then(() => {
        setStatus({ loading: false, sent: true, error: false });
        setForm({ name: '', email: '', message: '' });
        window.setTimeout(
          () => setStatus({ loading: false, sent: false, error: false }),
          4000
        );
      })
      .catch(() => setStatus({ loading: false, sent: false, error: true }));
  };

  return (
    <section id="closing" className="closing">
      <div className="closing__inner">
        <header className="closing__header">
          <p className="closing__eyebrow">Chapter 08</p>
          <h2 className="closing__title">The rest of the record</h2>
        </header>

        <div className="closing__columns">
          <div className="closing__col">
            <h3 className="closing__subhead">Publications</h3>
            <ul className="closing__list">
              {recognition.publications.map((pub) => (
                <li key={pub.title}>
                  {pub.href && pub.href !== '#' ? (
                    <a
                      className="closing__item-title closing__item-title--link"
                      href={pub.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {pub.title}
                    </a>
                  ) : (
                    <span className="closing__item-title">{pub.title}</span>
                  )}
                  <span className="closing__item-meta">
                    {pub.authors} · {pub.year}
                  </span>
                  <span className="closing__item-note">{pub.venue}</span>
                </li>
              ))}
            </ul>

            <h3 className="closing__subhead">Awards</h3>
            <ul className="closing__list">
              {recognition.awards.map((award) => (
                <li key={award.title}>
                  <span className="closing__item-title">{award.title}</span>
                  <span className="closing__item-meta">
                    {award.org} · {award.date}
                  </span>
                  <span className="closing__item-note">{award.note}</span>
                </li>
              ))}
            </ul>

            <h3 className="closing__subhead">Certifications</h3>
            <ul className="closing__list">
              {recognition.certifications.map((cert) => (
                <li key={cert.title}>
                  {cert.href ? (
                    <a
                      className="closing__item-title closing__item-title--link"
                      href={cert.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {cert.title}
                    </a>
                  ) : (
                    <span className="closing__item-title">{cert.title}</span>
                  )}
                  <span className="closing__item-meta">
                    {cert.org} · {cert.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="closing__col">
            <h3 className="closing__subhead">Leadership &amp; Service</h3>
            <ul className="closing__list">
              {recognition.leadership.map((item) => (
                <li key={`${item.title}-${item.org}`}>
                  <span className="closing__item-title">{item.title}</span>
                  <span className="closing__item-meta">
                    {item.org} · {item.date}
                  </span>
                  <span className="closing__item-note">{item.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="closing__contact">
          <div className="closing__contact-copy">
            <h3 className="closing__cta-title">Let&apos;s build something</h3>
            <p>
              I&apos;m open to backend, AI systems, and platform engineering roles.
              The fastest way to reach me is email.
            </p>

            <ul className="closing__links">
              <li>
                <a href={`mailto:${contactLinks.email}`}>{contactLinks.email}</a>
              </li>
              <li>
                <a href={`tel:${contactLinks.phone.replace(/[^\d+]/g, '')}`}>
                  {contactLinks.phone}
                </a>
              </li>
            </ul>

            <div className="closing__social">
              <a href={contactLinks.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href={contactLinks.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a href={contactLinks.devpost} target="_blank" rel="noopener noreferrer">
                Devpost
              </a>
              <a href={contactLinks.resume} target="_blank" rel="noopener noreferrer">
                Resume
              </a>
            </div>
          </div>

          <form ref={formRef} className="closing__form" onSubmit={handleSubmit}>
            <label>
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              <span>Message</span>
              <textarea
                name="message"
                rows="4"
                value={form.message}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit" disabled={status.loading}>
              {status.loading ? 'Sending…' : 'Send message'}
            </button>
            {status.sent ? (
              <p className="closing__status closing__status--ok">
                Thanks — that came through.
              </p>
            ) : null}
            {status.error ? (
              <p className="closing__status closing__status--bad">
                That didn&apos;t send. Email me directly at {contactLinks.email}.
              </p>
            ) : null}
          </form>
        </div>

        <p className="closing__footer">
          Built with React, three.js, and GSAP · {new Date().getFullYear()}
        </p>
      </div>
    </section>
  );
};

export default StoryClosing;
