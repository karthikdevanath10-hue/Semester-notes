import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import SubjectCard from '../components/SubjectCard';
import { Search, Library, ArrowRight, X, FileText, ExternalLink, Download, Rocket } from 'lucide-react';

const SUBJECTS_DATA = [
  // P-Cycle (Physics Cycle)
  { title: 'Mathematics-I', emoji: '📐', description: 'Calculus, linear algebra, and basic differential equations.', semester: 'P-Cycle' },
  { title: 'Engineering Physics', emoji: '⚛️', description: 'Engineering physics course covering lasers, fibers, and semiconductors.', semester: 'P-Cycle' },
  { title: 'C Programming', emoji: '💻', description: 'Foundations of computer programming in C, covering data structures and syntax.', semester: 'P-Cycle' },
  { title: 'Electrical Engineering (BEC)', emoji: '⚡', description: 'Introduction to AC/DC circuits, electromagnetic induction, and electrical machines.', semester: 'P-Cycle' },
  { title: 'Civil Engineering', emoji: '🏗️', description: 'Basic concepts of structural analysis, construction materials, and surveying.', semester: 'P-Cycle' },
  { title: 'Computer Aided Design (CAD)', emoji: '✍️', description: 'Introduction to engineering graphics, 2D drafting, and computer-aided design tools.', semester: 'P-Cycle' },
  
  // E-Cycle (Chemistry Cycle)
  { title: 'Mathematics-II', emoji: '📈', description: 'Vector calculus, numerical methods, and advanced calculus.', semester: 'E-Cycle' },
  { title: 'Python Programming', emoji: '🐍', description: 'Introduction to Python, covering syntax, scripting, and problem-solving.', semester: 'E-Cycle' },
  { title: 'Electronics Engineering', emoji: '🔌', description: 'Fundamentals of electronic components, diodes, transistors, and logic gates.', semester: 'E-Cycle' },
  { title: 'Mechanical Engineering (MES)', emoji: '⚙️', description: 'Basics of thermodynamics, steam turbines, refrigeration, and machine design.', semester: 'E-Cycle' },
  { title: 'Renewable Energy (RES)', emoji: '☀️', description: 'Study of solar energy, wind power, biomass, and other sustainable energy sources.', semester: 'E-Cycle' },
  
  // Semester 3
  { title: 'Data Structures', emoji: '📊', description: 'Linear and non-linear data structures: lists, stacks, queues, trees, graphs.', semester: 'Sem 3' },
  { title: 'Computer Organization', emoji: '🖥️', description: 'Basic structure of computers, machine instructions, and ALU design.', semester: 'Sem 3' },
  { title: 'Discrete Mathematics', emoji: '🧠', description: 'Set theory, logic, combinatorics, graph theory, and relations.', semester: 'Sem 3' },
  
  // Semester 4
  { title: 'Java Programming', emoji: '☕', description: 'Advanced object-oriented programming concepts using the Java platform.', semester: 'Sem 4' },
  { title: 'Algorithms (DAA)', emoji: '⚡', description: 'Algorithm design techniques, complexity analysis, and graph algorithms.', semester: 'Sem 4' },
  { title: 'Operating Systems', emoji: '💿', description: 'Process management, memory management, file systems, and concurrency.', semester: 'Sem 4' },
  
  // Semester 5
  { title: 'DBMS', emoji: '🗄️', description: 'Relational databases, SQL queries, normalization, and transaction control.', semester: 'Sem 5' },
  { title: 'Computer Networks', emoji: '🌐', description: 'TCP/IP layers, routing algorithms, socket programming, and protocols.', semester: 'Sem 5' },
  { title: 'Software Engineering', emoji: '📝', description: 'Software development lifecycles, UML modeling, testing, and agile.', semester: 'Sem 5' },
  
  // Semester 6
  { title: 'Web Development', emoji: '🕸️', description: 'Full-stack web applications, HTML, CSS, JavaScript, Node.js, and React.', semester: 'Sem 6' },
  { title: 'Compiler Design', emoji: '⚙️', description: 'Lexical analysis, parsing, code generation, and optimization phases.', semester: 'Sem 6' },
  { title: 'Machine Learning', emoji: '🤖', description: 'Supervised and unsupervised learning, regression, neural networks.', semester: 'Sem 6' },

  // Semester 7
  { title: 'Information Security', emoji: '🔒', description: 'Cryptography, network security, threat modeling, and secure coding practices.', semester: 'Sem 7' },
  { title: 'Cloud Computing', emoji: '☁️', description: 'Virtualization, cloud architectures, storage services, and serverless computing.', semester: 'Sem 7' },

  // Semester 8
  { title: 'Deep Learning', emoji: '🧠', description: 'Artificial neural networks, CNNs, RNNs, and generative AI models.', semester: 'Sem 8' },
  { title: 'Internet of Things', emoji: '🔌', description: 'Embedded systems, sensor networks, microcontrollers, and IoT protocols.', semester: 'Sem 8' }
];

const SEMESTERS = ['P-Cycle', 'E-Cycle', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

// Helper function to convert Google Drive share links to direct download links
const getDirectDownloadUrl = (url) => {
  if (!url) return '';
  const cleanUrl = url.trim();

  // Pattern 1: drive.google.com/file/d/FILE_ID/view...
  const fileDMatch = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileDMatch[1]}`;
  }

  // Pattern 2: drive.google.com/open?id=FILE_ID...
  const openIdMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (cleanUrl.includes('drive.google.com/open') && openIdMatch && openIdMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${openIdMatch[1]}`;
  }

  return cleanUrl;
};

const Home = ({ onOpenLogin }) => {
  const { currentUser, userRole } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState('P-Cycle');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Drawer States
  const [drawerData, setDrawerData] = useState(null); // { subjectTitle, categoryName, files: [] }
  const [drawerSearch, setDrawerSearch] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Reset drawer search and selection when the drawer subject/category changes
  useEffect(() => {
    setDrawerSearch('');
    setSelectedFiles([]);
  }, [drawerData]);

  useEffect(() => {
    // Real-time Firestore subscription for notes
    const q = query(collection(db, 'notes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList = [];
      snapshot.forEach((doc) => {
        notesList.push({ id: doc.id, ...doc.data() });
      });
      setNotes(notesList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notes:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Filter subjects based on semester and search query
  const filteredSubjects = SUBJECTS_DATA.filter((subject) => {
    const matchesSemester = subject.semester === selectedSemester;
    const matchesSearch = 
      subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSemester && matchesSearch;
  });

  // Get notes for a specific subject
  const getSubjectFiles = (subjectTitle) => {
    const subjectFiles = {};
    
    // Pre-initialize empty arrays for all doc types
    ['Module Notes', 'Question Bank', 'PYQs'].forEach(type => {
      subjectFiles[type] = [];
    });

    notes.forEach((note) => {
      if (
        note.semester === selectedSemester &&
        note.subject.toLowerCase() === subjectTitle.toLowerCase()
      ) {
        subjectFiles[note.type].push({
          id: note.id,
          fileName: note.fileName,
          fileUrl: note.fileUrl,
          createdAt: note.createdAt
        });
      }
    });
    return subjectFiles;
  };

  // Filter files listed inside the slide-out drawer
  const filteredDrawerFiles = drawerData
    ? drawerData.files.filter(f => f.fileName.toLowerCase().includes(drawerSearch.toLowerCase()))
    : [];

  const handleToggleSelectFile = (fileUrl) => {
    setSelectedFiles((prev) => 
      prev.includes(fileUrl) 
        ? prev.filter(url => url !== fileUrl) 
        : [...prev, fileUrl]
    );
  };

  const handleToggleSelectAll = (filteredFiles) => {
    const filteredUrls = filteredFiles.map(f => f.fileUrl);
    const allSelected = filteredUrls.every(url => selectedFiles.includes(url));
    
    if (allSelected) {
      setSelectedFiles(prev => prev.filter(url => !filteredUrls.includes(url)));
    } else {
      setSelectedFiles(prev => {
        const uniqueUrls = new Set([...prev, ...filteredUrls]);
        return Array.from(uniqueUrls);
      });
    }
  };

  const handleDownloadSelected = () => {
    if (selectedFiles.length === 0) return;
    
    if (selectedFiles.length > 2) {
      alert('Your browser might ask for permission to open multiple tabs. Please allow popups to download all selected files.');
    }

    selectedFiles.forEach((fileUrl, index) => {
      const downloadUrl = getDirectDownloadUrl(fileUrl);
      setTimeout(() => {
        window.open(downloadUrl, '_blank');
      }, index * 300); // 300ms delay to prevent browser popup blockers from blocking tabs
    });
  };

  return (
    <div className="main-content">
      <header className="page-header">
        <h1 className="page-title">
          Access Your <span>Semester Notes</span>
        </h1>
        <p className="page-subtitle">
          Unlock verified lecture notes, question banks, and previous year question papers (PYQs) for all engineering students.
        </p>
      </header>

      <section className="filter-section">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Search subjects (e.g. Data Structures, Java)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="semester-tabs">
          {SEMESTERS.map((sem) => (
            <button
              key={sem}
              className={`sem-tab ${selectedSemester === sem ? 'active' : ''}`}
              onClick={() => setSelectedSemester(sem)}
            >
              {sem}
            </button>
          ))}
        </div>
      </section>

      {selectedSemester !== 'P-Cycle' && selectedSemester !== 'E-Cycle' ? (
        <div className="empty-state coming-soon-state" style={{ padding: '5rem 2rem' }}>
          <div className="coming-soon-icon-wrapper" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            backgroundColor: 'rgba(99, 102, 241, 0.1)', 
            color: 'var(--accent-color)', 
            marginBottom: '1.5rem' 
          }}>
            <Rocket size={40} className="coming-soon-icon" style={{ animation: 'bounce 2s infinite' }} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.75rem' }}>Coming Soon!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            We are currently onboarding and verifying academic materials. Semester notes for <strong>{selectedSemester}</strong> will be available soon!
          </p>
          <button 
            className="btn btn-secondary" 
            onClick={() => setSelectedSemester('P-Cycle')}
            style={{ borderRadius: '20px', padding: '0.5rem 1.25rem' }}
          >
            Browse Active Cycles
          </button>
        </div>
      ) : loading ? (
        <div className="text-center" style={{ padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <div className="spinner">Syncing with Firestore...</div>
        </div>
      ) : (
        <>
          {filteredSubjects.length > 0 ? (
            <div className="subject-grid">
              {filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject.title}
                  subject={subject}
                  files={getSubjectFiles(subject.title)}
                  isAuthenticated={!!currentUser}
                  onOpenLogin={onOpenLogin}
                  onViewFiles={(subjectTitle, categoryName, fileList) => 
                    setDrawerData({ subjectTitle, categoryName, files: fileList })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Library size={48} style={{ color: 'var(--text-muted)' }} />
              <h3>No Subjects Found</h3>
              <p>We couldn't find any subjects matching "{searchQuery}" in {selectedSemester}.</p>
            </div>
          )}
        </>
      )}

      {/* About Us Section */}
      <section id="about" className="landing-section">
        <div className="section-header">
          <h2>About Us</h2>
          <p>Learn more about the AcademiX platform, our vision, and how we help engineering students excel.</p>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <h3>Our Mission</h3>
            <p>We aim to simplify academic access for engineering students by providing verified, high-quality lecture notes, curated question banks, and solved previous year question papers (PYQs)—all in one unified platform.</p>
          </div>
          <div className="about-card">
            <h3>Verified Content</h3>
            <p>Every document uploaded to AcademiX undergoes verification by our core admin team and faculty assistants to ensure accuracy, alignment with current university guidelines, and high readability standards.</p>
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="landing-section">
        <div className="section-header">
          <h2>Departments</h2>
          <p>We support various academic disciplines with resources mapped to their respective university syllabus guidelines.</p>
        </div>
        <div className="departments-grid">
          <div className="dept-pill">Computer Science (CSE)</div>
          <div className="dept-pill">Artificial Intelligence (AIML)</div>
          <div className="dept-pill">Computer Applications (BCA)</div>
          <div className="dept-pill">Civil Engineering</div>
          <div className="dept-pill">Electrical Engineering</div>
          <div className="dept-pill">Mechanical Engineering</div>
        </div>
      </section>

      {/* Announcements Section */}
      <section id="announcements" className="landing-section">
        <div className="section-header">
          <h2>Announcements</h2>
          <p>Stay up to date with recent syllabus changes, upload schedules, and notifications.</p>
        </div>
        <div className="announcements-container">
          <div className="announcement-item">
            <span className="announcement-date">July 2026</span>
            <h4>Syllabus Realignment</h4>
            <p>All Physics Cycle (P-Cycle) and Chemistry Cycle (E-Cycle) notes have been successfully updated to match the latest academic year guidelines.</p>
          </div>
          <div className="announcement-item">
            <span className="announcement-date">June 2026</span>
            <h4>Semester 3 Notes Launch</h4>
            <p>Verified notes and previous year question papers (PYQs) for Data Structures, Computer Organization, and Discrete Mathematics are now fully live!</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="landing-section">
        <div className="section-header">
          <h2>Contact Us</h2>
          <p>Have suggestions, feedback, or notes to contribute? We'd love to hear from you.</p>
        </div>
        <div className="contact-card">
          <div className="contact-info">
            <div>
              <strong>Email Support</strong>
              <p>support@kaurahub.com</p>
            </div>
            <div>
              <strong>Academic Support</strong>
              <p>academix@kaurahub.com</p>
            </div>
          </div>
          <div className="contact-form-placeholder">
            <p>If you would like to volunteer as a contributor, upload materials via the Admin Panel or reach out directly to the email addresses above.</p>
          </div>
        </div>
      </section>

      {/* Drawer Overlay Backdrop */}
      {drawerData && (
        <div className="drawer-overlay" onClick={() => setDrawerData(null)}>
          <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="drawer-subtitle">{drawerData.subjectTitle}</span>
                <h3 className="drawer-title">{drawerData.categoryName}</h3>
              </div>
              <button className="drawer-close-btn" onClick={() => setDrawerData(null)} aria-label="Close drawer">
                <X size={20} />
              </button>
            </div>

            <div className="drawer-search">
              <Search size={16} className="drawer-search-icon" />
              <input
                type="text"
                placeholder="Search files..."
                value={drawerSearch}
                onChange={(e) => setDrawerSearch(e.target.value)}
              />
            </div>

            {/* Actions Toolbar */}
            {filteredDrawerFiles.length > 0 && (
              <div className="drawer-actions-toolbar">
                <label className="select-all-label">
                  <input
                    type="checkbox"
                    checked={filteredDrawerFiles.map(f => f.fileUrl).every(url => selectedFiles.includes(url))}
                    onChange={() => handleToggleSelectAll(filteredDrawerFiles)}
                  />
                  <span>Select All</span>
                </label>
                
                <button 
                  className="btn btn-primary btn-sm btn-download-all"
                  onClick={handleDownloadSelected}
                  disabled={selectedFiles.length === 0}
                >
                  <Download size={14} />
                  <span>Download ({selectedFiles.length})</span>
                </button>
              </div>
            )}

            <div className="drawer-body">
              {filteredDrawerFiles.length > 0 ? (
                <div className="drawer-files-list">
                  {filteredDrawerFiles.map((file, idx) => (
                    <div key={file.id || idx} className="drawer-file-item-row">
                      <input
                        type="checkbox"
                        className="file-select-checkbox"
                        checked={selectedFiles.includes(file.fileUrl)}
                        onChange={() => handleToggleSelectFile(file.fileUrl)}
                      />
                      
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="drawer-file-item-link"
                      >
                        <div className="file-icon-wrapper">
                          <FileText size={18} />
                        </div>
                        <div className="file-info">
                          <span className="file-name" title={file.fileName}>{file.fileName}</span>
                          <span className="file-date">
                            {file.createdAt ? new Date(file.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently uploaded'}
                          </span>
                        </div>
                      </a>

                      <a
                        href={getDirectDownloadUrl(file.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-download-action-btn"
                        title="Download file"
                      >
                        <Download size={15} />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="drawer-empty">
                  <FileText size={40} style={{ opacity: 0.3 }} />
                  <p>No matching files found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

