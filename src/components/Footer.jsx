import React from 'react';
import { Globe, Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Brand Column */}
        <div className="footer-column brand-column">
          <h2>Kaurahub</h2>
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
            <span>+91 8660954976<br />+91 8088487801</span>
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
            <a href="#" aria-label="Website" target="_blank" rel="noopener noreferrer">
              <Globe size={18} />
            </a>
            <a href="#" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <Facebook size={18} />
            </a>
            <a href="#" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <Twitter size={18} />
            </a>
            <a href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <Instagram size={18} />
            </a>
            <a href="#" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p className="copyright">© 2026 Kaurahub. All rights reserved.</p>
          <p className="batch-info">CSE Department - 2024 Batch</p>
          <p className="creators">Created with <span className="heart-icon">💛</span> by Preetham Jain M | Purushotham K</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
