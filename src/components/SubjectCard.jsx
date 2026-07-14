import React, { useState } from 'react';
import { Lock, FileText, ArrowRight } from 'lucide-react';

const SubjectCard = ({ subject, files = {}, isAuthenticated, onOpenLogin, onViewFiles }) => {
  const { title, description, emoji, semester } = subject;
  const [isOpen, setIsOpen] = useState(false);
  
  const docTypes = ['Module Notes', 'Question Bank', 'PYQs'];

  const handleCategoryClick = (type, fileList) => {
    if (!isAuthenticated) {
      onOpenLogin();
      return;
    }
    if (fileList && fileList.length > 0) {
      onViewFiles(title, type, fileList);
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.card-categories-row') || e.target.closest('.explore-link')) {
      return;
    }
    setIsOpen(!isOpen);
  };

  // Helper to assign a clean gradient class based on subject title
  const getGradientClass = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('physics') || lower.includes('mechanic') || lower.includes('mes')) return 'grad-purple';
    if (lower.includes('c programming') || lower.includes('python')) return 'grad-blue';
    if (lower.includes('math') || lower.includes('electrical') || lower.includes('bec')) return 'grad-green';
    return 'grad-teal';
  };

  return (
    <div className={`subject-card ${isOpen ? 'expanded' : ''}`} onClick={handleCardClick}>
      <div className="card-top">
        <div className={`emoji-wrapper ${getGradientClass(title)}`} role="img" aria-label={title}>
          {emoji}
        </div>
      </div>
      
      <span className="subject-badge">{semester}</span>

      <div className="subject-title-area">
        <h2>{title}</h2>
      </div>

      <p className="subject-description">{description}</p>
      
      {/* Horizontal Options Row */}
      {isOpen && (
        <div className="card-categories-row">
          {docTypes.map((type) => {
            const fileList = files[type] || [];
            const count = fileList.length;
            const hasFiles = count > 0;
            
            return (
              <button
                key={type}
                className={`category-dropdown-btn ${!isAuthenticated ? 'locked' : ''} ${!hasFiles && isAuthenticated ? 'unavailable' : ''}`}
                onClick={() => handleCategoryClick(type, fileList)}
                disabled={isAuthenticated && !hasFiles}
                title={!isAuthenticated ? 'Login to unlock' : !hasFiles ? 'No files uploaded' : `View ${type}`}
              >
                <span>{type} {hasFiles ? `(${count})` : ''}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="explore-link" onClick={() => setIsOpen(!isOpen)}>
        <span>{isOpen ? 'Close files' : 'Explore files'}</span>
        <ArrowRight size={14} className="arrow-icon" />
      </div>
    </div>
  );
};

export default SubjectCard;


