import React from 'react';
import { Globe, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Brand Column */}
        <div className="footer-column brand-column">
          <h2>EETIRP.LTD</h2>
          <p>Empowering students with quality education and digital resources for academic excellence.</p>
        </div>

        {/* Quick Links Column */}
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#departments">Departments</a></li>
            <li><a href="#announcements">Announcements</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="footer-column contact-column">
          <h3>Contact Info</h3>
          <div className="footer-contact-item">
            <MapPin size={16} className="footer-icon" />
            <span>Sapthagiri NPS University<br />Bangalore, Karnataka, India</span>
          </div>
          <div className="footer-contact-item">
            <Phone size={16} className="footer-icon" />
            <span>+91 8660954976<br />+91 8088487801<br />+91 7411490271</span>
          </div>
          <div className="footer-contact-item">
            <Mail size={16} className="footer-icon" />
            <span>eetirpltd@gmail.com</span>
          </div>
        </div>

        {/* Follow Us Column */}
        <div className="footer-column social-column">
          <h3>Follow Us</h3>
          <div className="footer-social-links">
            <a href="https://eetirpltd.vercel.app/" aria-label="Website" target="_blank" rel="noopener noreferrer">
              <Globe size={18} />
            </a>
            <a href="https://www.facebook.com/share/18nVEnARj4/" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="#" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/eetirpltd?igsh=dmdjMHpzaXE0Z3A2" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect width="4" height="12" x="2" y="9"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">© 2026 EETIRP.LTD. All rights reserved.</p>
          <p className="batch-info">CSE Department - 2026 Batch</p>
          <p className="creators">Created with <span className="heart-icon">💛</span> by Kaurahub</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
