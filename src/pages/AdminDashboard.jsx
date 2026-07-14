import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { UploadCloud, Trash2, FileText, CheckCircle2, AlertCircle, FileSpreadsheet, Link2 } from 'lucide-react';

const SEMESTERS = ['P-Cycle', 'E-Cycle', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];

const SUBJECTS_BY_SEM = {
  'P-Cycle': ['Mathematics-I', 'Engineering Physics', 'C Programming', 'Electrical Engineering (BEC)', 'Civil Engineering', 'Computer Aided Design (CAD)'],
  'E-Cycle': ['Mathematics-II', 'Python Programming', 'Electronics Engineering', 'Mechanical Engineering (MES)', 'Renewable Energy (RES)'],
  'Sem 3': ['Data Structures', 'Computer Organization', 'Discrete Mathematics'],
  'Sem 4': ['Java Programming', 'Algorithms (DAA)', 'Operating Systems'],
  'Sem 5': ['DBMS', 'Computer Networks', 'Software Engineering'],
  'Sem 6': ['Web Development', 'Compiler Design', 'Machine Learning'],
  'Sem 7': ['Information Security', 'Cloud Computing'],
  'Sem 8': ['Deep Learning', 'Internet of Things']
};

const DOC_TYPES = ['Module Notes', 'Question Bank', 'PYQs'];

const AdminDashboard = () => {
  const { userData } = useAuth();
  
  // Form States
  const [semester, setSemester] = useState('P-Cycle');
  const [subject, setSubject] = useState(SUBJECTS_BY_SEM['P-Cycle'][0]);
  const [docType, setDocType] = useState('Module Notes');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  
  // Action States
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // File Manager States
  const [notes, setNotes] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [filterSemester, setFilterSemester] = useState('All');

  // Sync subject selection when semester changes
  useEffect(() => {
    setSubject(SUBJECTS_BY_SEM[semester][0]);
  }, [semester]);

  // Real-time listener for files table
  useEffect(() => {
    const q = query(collection(db, 'notes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      // Sort by upload time desc
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotes(list);
      setLoadingFiles(false);
    }, (err) => {
      console.error('Error fetching files:', err);
      setLoadingFiles(false);
    });

    return unsubscribe;
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fileName.trim()) {
      setErrorMsg('Please enter a display file name.');
      return;
    }

    if (!fileUrl.trim()) {
      setErrorMsg('Please enter a document URL.');
      return;
    }

    // Basic URL validation
    if (!fileUrl.trim().startsWith('http://') && !fileUrl.trim().startsWith('https://')) {
      setErrorMsg('Document URL must start with http:// or https://');
      return;
    }

    setUploading(true);
    
    try {
      // Save metadata doc in firestore
      await addDoc(collection(db, 'notes'), {
        fileName: fileName.trim(),
        semester,
        subject,
        type: docType,
        fileUrl: fileUrl.trim(),
        storagePath: '',
        uploadedBy: userData?.name || 'Admin',
        createdAt: new Date().toISOString()
      });

      setSuccessMsg(`"${fileName}" added successfully!`);
      setFileName('');
      setFileUrl('');
    } catch (dbErr) {
      console.error('Firestore save failed:', dbErr);
      setErrorMsg('Failed to save document details to database.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (note) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${note.fileName}"?`);
    if (!confirmDelete) return;

    try {
      // Delete from firestore only
      await deleteDoc(doc(db, 'notes', note.id));
      alert('File record deleted successfully.');
    } catch (error) {
      console.error('Deletion error:', error);
      alert('Failed to delete file. Please check permissions.');
    }
  };

  const handleDeleteAllFiles = async () => {
    const confirmDelete = window.confirm(`WARNING: Are you sure you want to delete ALL ${notes.length} uploaded files from the database? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      setLoadingFiles(true);
      const deletePromises = notes.map(note => deleteDoc(doc(db, 'notes', note.id)));
      await Promise.all(deletePromises);
      alert('All file records have been deleted successfully.');
    } catch (error) {
      console.error('Error deleting all files:', error);
      alert('Failed to delete all files. Please try again.');
    } finally {
      setLoadingFiles(false);
    }
  };

  // Filter notes in table
  const displayedNotes = filterSemester === 'All' 
    ? notes 
    : notes.filter(n => n.semester === filterSemester);

  return (
    <div className="main-content">
      <header className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Faculty Control Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage course resources, upload lecture sheets, and PYQs.</p>
        </div>
        <div className="user-badge" style={{ backgroundColor: 'var(--accent-light)' }}>
          <span className="user-badge-name" style={{ color: 'var(--accent-color)', fontWeight: 700 }}>
            {userData?.name || 'Administrator'}
          </span>
          <span className="user-badge-role">Faculty</span>
        </div>
      </header>

      <div className="admin-panes">
        {/* Left Pane: Upload Tool */}
        <section className="admin-pane">
          <h2 className="admin-pane-title">
            <UploadCloud size={20} style={{ color: 'var(--accent-color)' }} />
            Upload Document
          </h2>

          {successMsg && (
            <div className="error-message" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--success-color)', color: 'var(--success-color)' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit}>
            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <select 
                id="semester" 
                value={semester} 
                onChange={(e) => setSemester(e.target.value)}
                disabled={uploading}
              >
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <select 
                id="subject" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                disabled={uploading}
              >
                {SUBJECTS_BY_SEM[semester].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="docType">Document Type</label>
              <select 
                id="docType" 
                value={docType} 
                onChange={(e) => setDocType(e.target.value)}
                disabled={uploading}
              >
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fileName">Display File Name</label>
              <input 
                type="text" 
                id="fileName"
                placeholder="e.g. Unit 1 Introduction to C"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                disabled={uploading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fileUrl">Document Link (Google Drive, Dropbox, etc.)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="url" 
                  id="fileUrl"
                  placeholder="https://drive.google.com/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  disabled={uploading}
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Link2 size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={uploading}
            >
              {uploading ? 'Saving Link...' : 'Save Document Link'}
            </button>
          </form>
        </section>

        {/* Right Pane: File Manager */}
        <section className="admin-pane" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="admin-pane-title" style={{ marginBottom: 0 }}>
              <FileSpreadsheet size={20} style={{ color: 'var(--accent-color)' }} />
              File Manager
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filter:</span>
                <select 
                  value={filterSemester} 
                  onChange={(e) => setFilterSemester(e.target.value)}
                  style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                >
                  <option value="All">All Semesters</option>
                  {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button 
                onClick={handleDeleteAllFiles}
                className="btn btn-danger"
                style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem' }}
                disabled={notes.length === 0}
              >
                Delete All Uploads
              </button>
            </div>
          </div>

          {loadingFiles ? (
            <div className="text-center" style={{ padding: '3rem 0', color: 'var(--text-secondary)' }}>
              Loading files list...
            </div>
          ) : displayedNotes.length > 0 ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Semester</th>
                    <th>Subject</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedNotes.map((note) => (
                    <tr key={note.id}>
                      <td>
                        <div className="file-name-cell" title={note.fileName}>
                          {note.fileName.length > 30 ? `${note.fileName.substring(0, 27)}...` : note.fileName}
                        </div>
                      </td>
                      <td>{note.semester}</td>
                      <td>{note.subject}</td>
                      <td>
                        <span className={`table-badge ${
                          note.type === 'Module Notes' ? 'table-badge-notes' :
                          note.type === 'Question Bank' ? 'table-badge-qbank' : 'table-badge-pyq'
                        }`}>
                          {note.type}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-danger" 
                          onClick={() => handleDeleteFile(note)}
                          style={{ padding: '0.35rem', borderRadius: '4px' }}
                          title="Delete document and DB record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <FileText size={36} style={{ color: 'var(--text-muted)' }} />
              <h3>No Documents Found</h3>
              <p>No course resources have been uploaded for {filterSemester === 'All' ? 'any semester' : filterSemester} yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
