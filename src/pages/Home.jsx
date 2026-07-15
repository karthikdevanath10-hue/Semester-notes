import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import SubjectCard from '../components/SubjectCard';
import { Search, X, FileText, Download, Rocket, MapPin, Phone, Mail, Clock } from 'lucide-react';

const DEPARTMENTS = [
  { name: 'Computer Science', emoji: '💻', description: 'Core programming, algorithms, networks, and advanced computing materials.' },
  { name: 'Artificial Intelligence', emoji: '🧠', description: 'Machine learning models, neural networks, data analysis, and scripting.' },
  { name: 'Computer Applications', emoji: '🖥️', description: 'Database management systems, software development, and web environments.' },
  { name: 'Civil Engineering', emoji: '🏗️', description: 'Structural engineering, building materials, surveying, and graphics.' },
  { name: 'Electrical Engineering', emoji: '⚡', description: 'Circuit analysis, AC/DC machines, electromagnetics, and basic electronics.' },
  { name: 'Mechanical Engineering', emoji: '⚙️', description: 'Thermodynamics, fluid mechanics, machine design, and steam turbines.' }
];

const ALL_DEPARTMENTS = DEPARTMENTS.map(d => d.name);

const SUBJECTS_DATA = [
  // P-Cycle (Physics Cycle - Common to all departments)
  { title: 'Mathematics-I', emoji: '📐', description: 'Calculus, linear algebra, and basic differential equations.', semester: 'P-Cycle', departments: ALL_DEPARTMENTS },
  { title: 'Engineering Physics', emoji: '⚛️', description: 'Engineering physics course covering lasers, fibers, and semiconductors.', semester: 'P-Cycle', departments: ALL_DEPARTMENTS },
  { title: 'C Programming', emoji: '💻', description: 'Foundations of computer programming in C, covering data structures and syntax.', semester: 'P-Cycle', departments: ALL_DEPARTMENTS },
  { title: 'Electrical Engineering (BEC)', emoji: '⚡', description: 'Introduction to AC/DC circuits, electromagnetic induction, and electrical machines.', semester: 'P-Cycle', departments: ALL_DEPARTMENTS },
  { title: 'Civil Engineering', emoji: '🏗️', description: 'Basic concepts of structural analysis, construction materials, and surveying.', semester: 'P-Cycle', departments: ALL_DEPARTMENTS },
  { title: 'Computer Aided Design (CAD)', emoji: '✍️', description: 'Introduction to engineering graphics, 2D drafting, and computer-aided design tools.', semester: 'P-Cycle', departments: ALL_DEPARTMENTS },

  // E-Cycle (Chemistry Cycle - Common to all departments)
  { title: 'Mathematics-II', emoji: '📈', description: 'Vector calculus, numerical methods, and advanced calculus.', semester: 'E-Cycle', departments: ALL_DEPARTMENTS },
  { title: 'Python Programming', emoji: '🐍', description: 'Introduction to Python, covering syntax, scripting, and problem-solving.', semester: 'E-Cycle', departments: ALL_DEPARTMENTS },
  { title: 'Electronics Engineering', emoji: '🔌', description: 'Fundamentals of electronic components, diodes, transistors, and logic gates.', semester: 'E-Cycle', departments: ALL_DEPARTMENTS },
  { title: 'Mechanical Engineering (MES)', emoji: '⚙️', description: 'Basics of thermodynamics, steam turbines, refrigeration, and machine design.', semester: 'E-Cycle', departments: ALL_DEPARTMENTS },
  { title: 'Renewable Energy (RES)', emoji: '☀️', description: 'Study of solar energy, wind power, biomass, and other sustainable energy sources.', semester: 'E-Cycle', departments: ALL_DEPARTMENTS },

  // Semester 3
  { title: 'Data Structures', emoji: '📊', description: 'Linear and non-linear data structures: lists, stacks, queues, trees, graphs.', semester: 'Sem 3', departments: ['Computer Science'] },
  { title: 'Computer Organization', emoji: '🖥️', description: 'Basic structure of computers, machine instructions, and ALU design.', semester: 'Sem 3', departments: ['Computer Science'] },
  { title: 'Discrete Mathematics', emoji: '🧠', description: 'Set theory, logic, combinatorics, graph theory, and relations.', semester: 'Sem 3', departments: ['Computer Science'] },

  // Semester 4
  { title: 'Java Programming', emoji: '☕', description: 'Advanced object-oriented programming concepts using the Java platform.', semester: 'Sem 4', departments: ['Computer Science'] },
  { title: 'Algorithms (DAA)', emoji: '⚡', description: 'Algorithm design techniques, complexity analysis, and graph algorithms.', semester: 'Sem 4', departments: ['Computer Science'] },
  { title: 'Operating Systems', emoji: '💿', description: 'Process management, memory management, file systems, and concurrency.', semester: 'Sem 4', departments: ['Computer Science'] },

  // Semester 5
  { title: 'DBMS', emoji: '🗄️', description: 'Relational databases, SQL queries, normalization, and transaction control.', semester: 'Sem 5', departments: ['Computer Science'] },
  { title: 'Computer Networks', emoji: '🌐', description: 'TCP/IP layers, routing algorithms, socket programming, and protocols.', semester: 'Sem 5', departments: ['Computer Science'] },
  { title: 'Software Engineering', emoji: '📝', description: 'Software development lifecycles, UML modeling, testing, and agile.', semester: 'Sem 5', departments: ['Computer Science'] },

  // Semester 6
  { title: 'Web Development', emoji: '🕸️', description: 'Full-stack web applications, HTML, CSS, JavaScript, Node.js, and React.', semester: 'Sem 6', departments: ['Computer Science'] },
  { title: 'Compiler Design', emoji: '⚙️', description: 'Lexical analysis, parsing, code generation, and optimization phases.', semester: 'Sem 6', departments: ['Computer Science'] },
  { title: 'Machine Learning', emoji: '🤖', description: 'Supervised and unsupervised learning, regression, neural networks.', semester: 'Sem 6', departments: ['Computer Science'] },

  // Semester 7
  { title: 'Information Security', emoji: '🔒', description: 'Cryptography, network security, threat modeling, and secure coding practices.', semester: 'Sem 7', departments: ['Computer Science'] },
  { title: 'Cloud Computing', emoji: '☁️', description: 'Virtualization, cloud architectures, storage services, and serverless computing.', semester: 'Sem 7', departments: ['Computer Science'] },

  // Semester 8
  { title: 'Deep Learning', emoji: '🧠', description: 'Artificial neural networks, CNNs, RNNs, and generative AI models.', semester: 'Sem 8', departments: ['Computer Science'] },
  { title: 'Internet of Things', emoji: '🔌', description: 'Embedded systems, sensor networks, microcontrollers, and IoT protocols.', semester: 'Sem 8', departments: ['Computer Science'] }
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
  const { currentUser } = useAuth();
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSem, setSelectedSem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drawer States
  const [drawerData, setDrawerData] = useState(null); // { subjectTitle, categoryName, files: [] }
  const [drawerSearch, setDrawerSearch] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Reset navigation states when URL hash points to #departments
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#departments') {
        setSelectedDept(null);
        setSelectedSem(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  // Filter subjects based on department, semester, and search query
  const filteredSubjects = SUBJECTS_DATA.filter((subject) => {
    const matchesDept = subject.departments && subject.departments.includes(selectedDept);
    const matchesSemester = subject.semester === selectedSem;
    const matchesSearch =
      subject.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSemester && matchesSearch;
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
        note.semester === selectedSem &&
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

      {/* Conditional Breadcrumb Navigation */}
      {(selectedDept || selectedSem) && (
        <div className="breadcrumb-nav">
          <button onClick={() => { setSelectedDept(null); setSelectedSem(null); }} className="breadcrumb-link">
            Home
          </button>
          {selectedDept && (
            <>
              <span className="breadcrumb-separator">/</span>
              <button onClick={() => setSelectedSem(null)} className="breadcrumb-link">
                {selectedDept}
              </button>
            </>
          )}
          {selectedSem && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{selectedSem}</span>
            </>
          )}
        </div>
      )}

      {/* Explorer Content */}
      {!selectedDept ? (
        /* STEP 1: Select Department */
        <section id="departments" className="landing-section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <h2>Departments</h2>
            <p>Select your department to explore semester notes, question banks, and study resources.</p>
          </div>
          <div className="departments-grid">
            {DEPARTMENTS.map((dept) => (
              <div 
                key={dept.name} 
                className="dept-card"
                onClick={() => setSelectedDept(dept.name)}
              >
                <div className="dept-icon-wrapper">{dept.emoji}</div>
                <h3>{dept.name}</h3>
                <p>{dept.description}</p>
              </div>
            ))}
          </div>
        </section>
      ) : !selectedSem ? (
        /* STEP 2: Select Semester */
        <section className="semesters-container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2>{selectedDept}</h2>
            <p>Select a semester or academic cycle to view mapped syllabus resources.</p>
          </div>
          <div className="semesters-grid">
            {SEMESTERS.map((sem) => (
              <div 
                key={sem} 
                className="sem-card"
                onClick={() => setSelectedSem(sem)}
              >
                <div className="sem-card-icon">🎓</div>
                <h3>{sem}</h3>
                <p>Explore resources and notes mapped to {sem} of {selectedDept}.</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* STEP 3: Select Subjects and show notes */
        <>
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2>{selectedDept} - {selectedSem}</h2>
            <p>Access notes, question banks, and PYQs verified by faculty.</p>
          </div>

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
          </section>

          {filteredSubjects.length === 0 ? (
            /* Bouncing Rocket Coming Soon for empty subjects mapping */
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
                We are currently onboarding and verifying academic materials. Notes for <strong>{selectedDept} - {selectedSem}</strong> will be available soon!
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedSem(null)}
                style={{ borderRadius: '20px', padding: '0.5rem 1.25rem' }}
              >
                Go Back to Semester List
              </button>
            </div>
          ) : loading ? (
            <div className="text-center" style={{ padding: '4rem 0', color: 'var(--text-secondary)' }}>
              <div className="spinner">Syncing with Firestore...</div>
            </div>
          ) : (
            <div className="subject-grid">
              {filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject.title}
                  subject={subject}
                  files={getSubjectFiles(subject.title)}
                  isAuthenticated={!!currentUser}
                  onOpenLogin={onOpenLogin}
                  onViewFiles={(subjectTitle, categoryName, fileList) => {
                    setDrawerSearch('');
                    setSelectedFiles([]);
                    setDrawerData({ subjectTitle, categoryName, files: fileList });
                  }}
                />
              ))}
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

      {/* Contact Section */}
      <section id="contact" className="landing-section">
        <div className="section-header">
          <h2>Contact Us</h2>
          <p>Have suggestions, feedback, or notes to contribute? We'd love to hear from you.</p>
        </div>

        <div className="contact-container">
          {/* Left Info Columns */}
          <div className="contact-info-column">

            {/* Address Card */}
            <div className="contact-info-card">
              <div className="info-icon-wrapper">
                <MapPin size={20} />
              </div>
              <div className="info-card-text">
                <h3>Address</h3>
                <p>Sapthagiri NPS University</p>
                <p>Chikkabanavara, Bangalore</p>
                <p>Karnataka - 560090, India</p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="contact-info-card">
              <div className="info-icon-wrapper">
                <Phone size={20} />
              </div>
              <div className="info-card-text">
                <h3>Phone</h3>
                <p><a href="tel:+918660954976">+91 8660954976</a></p>
                <p><a href="tel:+918088487801">+91 8088487801</a></p>
                <p><a href="tel:+917411490271">+91 7411490271</a></p>
              </div>
            </div>

            {/* Email Card */}
            <div className="contact-info-card">
              <div className="info-icon-wrapper">
                <Mail size={20} />
              </div>
              <div className="info-card-text">
                <h3>Email</h3>
                <p><a href="mailto:eetirpltd@gmail.com">eetirpltd@gmail.com</a></p>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="contact-info-card">
              <div className="info-icon-wrapper">
                <Clock size={20} />
              </div>
              <div className="info-card-text">
                <h3>Office Hours</h3>
                <p>Monday - Friday: 9:00 AM - 5:00 PM</p>
                <p>Saturday: 9:00 AM - 1:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>

          </div>

          {/* Right Form Card */}
          <form className="contact-form-card" onSubmit={async (e) => {
            e.preventDefault();
            const submitButton = e.target.querySelector('.btn-submit-message');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            const formData = new FormData(e.target);
            const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE";
            formData.append("access_key", accessKey);

            try {
              const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
              });
              const data = await response.json();
              if (data.success) {
                alert('Thank you for your message! We will get back to you shortly.');
                e.target.reset();
              } else {
                alert(data.message || 'Something went wrong. Please try again.');
              }
            } catch {
              alert('Error sending message. Please check your connection and try again.');
            } finally {
              submitButton.textContent = originalText;
              submitButton.disabled = false;
            }
          }}>
            <h2>Send us a Message</h2>

            <div className="form-row-two-col">
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="name" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" name="email" placeholder="john@example.com" required />
              </div>
            </div>

            <div className="form-row-two-col">
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="+91 98765 43210" />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input type="text" name="subject" placeholder="Suggestion's" required />
              </div>
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea name="message" placeholder="Tell us how we can help you..." rows={5} required></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-submit-message">
              Send Message
            </button>
          </form>
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

