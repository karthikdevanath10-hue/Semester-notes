import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, query, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { UploadCloud, Trash2, FileText, CheckCircle2, AlertCircle, FileSpreadsheet, Link2, ChevronUp, ChevronDown, Edit2, Check, X, Eye } from 'lucide-react';

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
  
  // Tab & Directory States
  const [activeTab, setActiveTab] = useState('uploads'); // 'uploads' or 'students'
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States
  const [semester, setSemester] = useState('P-Cycle');
  const [subject, setSubject] = useState(SUBJECTS_BY_SEM['P-Cycle'][0]);
  const [docType, setDocType] = useState('Module Notes');
  const [department, setDepartment] = useState('All');
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
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');

  // Edit Filename States
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Reset subject, category and department filters when semester filter changes
  useEffect(() => {
    setFilterSubject('All');
    setFilterType('All');
    setFilterDepartment('All');
  }, [filterSemester]);

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
      // Sort by sortOrder asc, fallback to createdAt asc
      list.sort((a, b) => {
        const orderA = a.sortOrder !== undefined ? a.sortOrder : 0;
        const orderB = b.sortOrder !== undefined ? b.sortOrder : 0;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
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
    
    // Get all existing notes in this category to calculate the next sortOrder
    const sameCategoryNotes = notes.filter(n => 
      n.semester === semester && 
      n.subject === subject && 
      n.type === docType &&
      (n.department || 'All') === department
    );
    const nextSortOrder = sameCategoryNotes.length;
    
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
        createdAt: new Date().toISOString(),
        sortOrder: nextSortOrder,
        department: department
      });

      setSuccessMsg(`"${fileName}" added successfully!`);
      setFileName('');
      setFileUrl('');
      setDepartment('All');
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

  // Real-time listener for users table
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setUsers(list);
      setLoadingUsers(false);
    }, (err) => {
      console.error('Error fetching users:', err);
      setLoadingUsers(false);
    });

    return unsubscribe;
  }, []);

  const handleToggleSuspendUser = async (user) => {
    const isSuspended = user.suspended || false;
    const confirmAction = window.confirm(`Are you sure you want to ${isSuspended ? 'unsuspend' : 'suspend'} student "${user.name}"?`);
    if (!confirmAction) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        suspended: !isSuspended
      });
      alert(`Student "${user.name}" has been successfully ${isSuspended ? 'unsuspended' : 'suspended'}.`);
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update student status.');
    }
  };

  const handleRemoveUser = async (user) => {
    const confirmDelete = window.confirm(`WARNING: Are you sure you want to permanently delete the profile of student "${user.name}" (USN: ${user.usn || 'N/A'})? This will remove their registration from the database.`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid));
      alert(`Student "${user.name}" has been successfully removed.`);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to remove student.');
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleMoveNote = async (note, direction, index) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= displayedNotes.length) return;

    const currentNote = note;
    const siblingNote = displayedNotes[targetIndex];

    try {
      // Assign explicit indexes in the current list as the new sortOrder
      await Promise.all([
        updateDoc(doc(db, 'notes', currentNote.id), { sortOrder: targetIndex }),
        updateDoc(doc(db, 'notes', siblingNote.id), { sortOrder: index })
      ]);
    } catch (err) {
      console.error('Error reordering notes:', err);
      alert('Failed to update note order.');
    }
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setEditingName(note.fileName);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (note) => {
    if (!editingName.trim()) {
      alert('File name cannot be empty.');
      return;
    }

    try {
      await updateDoc(doc(db, 'notes', note.id), {
        fileName: editingName.trim()
      });
      setEditingNoteId(null);
      setEditingName('');
    } catch (err) {
      console.error('Error updating filename:', err);
      alert('Failed to update file name.');
    }
  };

  // Filter notes in table
  const displayedNotes = notes.filter(note => {
    const semMatch = filterSemester === 'All' || note.semester === filterSemester;
    const subMatch = filterSubject === 'All' || note.subject.toLowerCase() === filterSubject.toLowerCase();
    const typeMatch = filterType === 'All' || note.type === filterType;
    const deptMatch = filterDepartment === 'All' || (note.department || 'All') === filterDepartment;
    return semMatch && subMatch && typeMatch && deptMatch;
  });

  const canReorder = filterSemester !== 'All' && filterSubject !== 'All' && filterType !== 'All';
  const hasActiveFilters = filterSemester !== 'All' || filterSubject !== 'All' || filterType !== 'All' || filterDepartment !== 'All';

  const handleClearFilters = () => {
    setFilterSemester('All');
    setFilterSubject('All');
    setFilterType('All');
    setFilterDepartment('All');
  };

  return (
    <div className="main-content">
      <header className="admin-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Faculty Control Center</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage course resources, user accounts, and system data.</p>
        </div>
        <div className="user-badge" style={{ backgroundColor: 'var(--accent-light)' }}>
          <span className="user-badge-name" style={{ color: 'var(--accent-color)', fontWeight: 700 }}>
            {userData?.name || 'Administrator'}
          </span>
          <span className="user-badge-role">Faculty</span>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'uploads' ? 'active' : ''}`}
          onClick={() => setActiveTab('uploads')}
        >
          Resource Manager
        </button>
        <button 
          className={`admin-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Student Directory
        </button>
      </div>

      {activeTab === 'uploads' && (
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

              {/* Department Selector */}
              <div className="form-group">
                <label htmlFor="department">Department Access</label>
                <select 
                  id="department" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  disabled={uploading}
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Filter:</span>
                  
                  {/* Department Filter */}
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    <option value="All">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>

                  {/* Semester Filter */}
                  <select 
                    value={filterSemester} 
                    onChange={(e) => setFilterSemester(e.target.value)}
                    style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    <option value="All">All Semesters</option>
                    {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  {/* Subject Filter (Enabled only when a semester is selected) */}
                  {filterSemester !== 'All' && (
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    >
                      <option value="All">All Subjects</option>
                      {SUBJECTS_BY_SEM[filterSemester].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  )}

                  {/* Category Filter (Enabled only when a semester is selected) */}
                  {filterSemester !== 'All' && (
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      style={{ padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                    >
                      <option value="All">All Categories</option>
                      {['Module Notes', 'Question Bank', 'PYQs'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  )}

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '6px', 
                        fontSize: '0.8rem', 
                        border: '1px solid var(--border-color)', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.25rem', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        color: 'var(--text-secondary)',
                        cursor: 'pointer' 
                      }}
                      title="Reset all filters to All"
                    >
                      <X size={12} /> Clear Filters
                    </button>
                  )}
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

            {!canReorder && (
              <div className="reorder-tip">
                💡 <strong>Tip:</strong> Select a specific <strong>Semester</strong>, <strong>Subject</strong>, and <strong>Category</strong> filter above to enable Up/Down arrows and arrange the PDFs in your desired order.
              </div>
            )}

            {loadingFiles ? (
              <div className="text-center" style={{ padding: '3rem 0', color: 'var(--text-secondary)' }}>
                Loading files list...
              </div>
            ) : displayedNotes.length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      {canReorder && <th style={{ textAlign: 'center', width: '90px' }}>Order</th>}
                      <th>File Name</th>
                      <th>Department</th>
                      <th>Semester</th>
                      <th>Subject</th>
                      <th>Type</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedNotes.map((note, idx) => (
                      <tr key={note.id}>
                        {canReorder && (
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="btn-reorder"
                                onClick={() => handleMoveNote(note, 'up', idx)}
                                disabled={idx === 0 || editingNoteId === note.id}
                                title="Move Up"
                              >
                                <ChevronUp size={16} />
                              </button>
                              <button
                                type="button"
                                className="btn-reorder"
                                onClick={() => handleMoveNote(note, 'down', idx)}
                                disabled={idx === displayedNotes.length - 1 || editingNoteId === note.id}
                                title="Move Down"
                              >
                                <ChevronDown size={16} />
                              </button>
                            </div>
                          </td>
                        )}
                        <td>
                          {editingNoteId === note.id ? (
                            <input 
                              type="text" 
                              value={editingName} 
                              onChange={(e) => setEditingName(e.target.value)}
                              style={{ 
                                padding: '0.35rem 0.5rem', 
                                borderRadius: '4px', 
                                border: '1px solid var(--accent-color)', 
                                width: '100%', 
                                fontSize: '0.9rem', 
                                color: 'var(--text-primary)', 
                                backgroundColor: 'var(--bg-secondary)',
                                outline: 'none'
                              }}
                              autoFocus
                            />
                          ) : (
                            <div className="file-name-cell" title={note.fileName}>
                              {note.fileName.length > 30 ? `${note.fileName.substring(0, 27)}...` : note.fileName}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {note.department || 'All'}
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
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {editingNoteId === note.id ? (
                              <>
                                <button 
                                  className="btn btn-success" 
                                  onClick={() => handleSaveEdit(note)}
                                  style={{ padding: '0.35rem', borderRadius: '4px' }}
                                  title="Save Name"
                                >
                                  <Check size={14} />
                                </button>
                                <button 
                                  className="btn btn-secondary" 
                                  onClick={handleCancelEdit}
                                  style={{ padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <>
                                <a 
                                  href={note.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="btn btn-info" 
                                  style={{ padding: '0.35rem', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                  title="View/Open PDF"
                                >
                                  <Eye size={14} />
                                </a>
                                <button 
                                  className="btn btn-warning" 
                                  onClick={() => handleStartEdit(note)}
                                  style={{ padding: '0.35rem', borderRadius: '4px', color: 'white' }}
                                  title="Edit file name"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  className="btn btn-danger" 
                                  onClick={() => handleDeleteFile(note)}
                                  style={{ padding: '0.35rem', borderRadius: '4px' }}
                                  title="Delete document and DB record"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
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
      )}

      {activeTab === 'students' && (
        <div className="admin-pane" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="admin-pane-title" style={{ marginBottom: 0 }}>
              <FileText size={20} style={{ color: 'var(--accent-color)' }} />
              Student Registrations
            </h2>

            <div className="search-bar-container">
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search by Name, USN, or Email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="text-center" style={{ padding: '3rem 0', color: 'var(--text-secondary)' }}>
              Loading registrations directory...
            </div>
          ) : (
            (() => {
              const students = users.filter(u => u.role === 'student');
              const filteredStudents = students.filter(student => 
                student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                student.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.email.toLowerCase().includes(searchQuery.toLowerCase())
              );

              return filteredStudents.length > 0 ? (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>USN</th>
                        <th>Email Address</th>
                        <th>Status</th>
                        <th>Joined Date</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.uid}>
                          <td>
                            <div className="file-name-cell" style={{ fontWeight: 600 }} title={student.name}>
                              {student.name}
                            </div>
                          </td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{student.usn || 'N/A'}</td>
                          <td>{student.email}</td>
                          <td>
                            <span className={`table-badge ${student.suspended ? 'table-badge-suspended' : 'table-badge-active'}`}>
                              {student.suspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td>
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button 
                                className={`btn ${student.suspended ? 'btn-success' : 'btn-warning'}`}
                                onClick={() => handleToggleSuspendUser(student)}
                                style={{ padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}
                              >
                                {student.suspended ? 'Unsuspend' : 'Suspend'}
                              </button>
                              <button 
                                className="btn btn-danger" 
                                onClick={() => handleRemoveUser(student)}
                                style={{ padding: '0.35rem', borderRadius: '4px' }}
                                title="Remove Student Registration"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '3rem 1rem' }}>
                  <FileText size={36} style={{ color: 'var(--text-muted)' }} />
                  <h3>No Students Found</h3>
                  <p>
                    {students.length === 0 
                      ? 'No students have registered on this platform yet.' 
                      : `No students match the search query "${searchQuery}".`}
                  </p>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
