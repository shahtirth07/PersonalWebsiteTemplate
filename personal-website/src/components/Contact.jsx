import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';

const Contact = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: false });

    emailjs.sendForm(
      'service_iwxq52i', // Replace with your EmailJS service ID
      'template_omvfhla', // Replace with your EmailJS template ID
      form.current,
      'VbZvvR4YCnNxFoFGc' // Replace with your EmailJS public key
    )
      .then((result) => {
        setStatus({ loading: false, success: true, error: false });
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => {
          setStatus({ loading: false, success: false, error: false });
        }, 3000);
      })
      .catch((error) => {
        setStatus({ loading: false, success: false, error: true });
        console.error('Error sending email:', error);
      });
  };

  return (
    <section id="contact" className="contact-section">
      <h2 className="contact-title">Contact Me</h2>
      <div className="contact-container">
        <div className="contact-info">
          <h3>Let's Connect</h3>
          <p>Feel free to reach out to me for any opportunities or just to say hello!</p>
          <div className="social-links">
            <a href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="https://github.com/your-username" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="mailto:your.email@example.com">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
        <form ref={form} className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
            />
          </div>
          <div className="form-group">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              required
            ></textarea>
          </div>
          <button 
            type="submit" 
            className={`submit-btn ${status.loading ? 'loading' : ''}`}
            disabled={status.loading}
          >
            {status.loading ? 'Sending...' : 'Send Message'}
          </button>
          {status.success && (
            <div className="status-message success">
              Message sent successfully!
            </div>
          )}
          {status.error && (
            <div className="status-message error">
              Failed to send message. Please try again.
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default Contact; 