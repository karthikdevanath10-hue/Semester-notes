import React, { useState } from 'react';
import { Lock, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const SubjectCard = ({ subject, files = {}, isAuthenticated, onOpenLogin, onViewFiles }) => {
  const { title, description, emoji } = subject;
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
    if (e.target.closest('.card-categories-row') || e.target.closest('.subject-description')) {
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className={`subject-card ${isOpen ? 'expanded' : ''}`} onClick={handleCardClick}>
      <div className="card-top">
        <div className="emoji-wrapper" role="img" aria-label={title}>
          {emoji}
        </div>
      </div>
      
      {/* Subject Name Trigger Area */}
      <div className="subject-dropdown-trigger">
        <h2>{title}</h2>
        {isOpen ? <ChevronUp size={18} className="chevron-icon" /> : <ChevronDown size={18} className="chevron-icon" />}
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
                {!isAuthenticated ? <Lock size={12} /> : <FileText size={12} />}
                <span>{type} {hasFiles ? `(${count})` : ''}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectCard;


