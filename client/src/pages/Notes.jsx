import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, X, Edit2, Trash2, FileText } from 'lucide-react';
import './Notes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/notes`);
            setNotes(res.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const handleOpenModal = (note = null) => {
        if (note) {
            setEditingNote(note);
            setFormData({ title: note.title, content: note.content });
        } else {
            setEditingNote(null);
            setFormData({ title: '', content: '' });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingNote(null);
        setFormData({ title: '', content: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingNote) {
                const res = await axios.put(`${API_URL}/api/notes/${editingNote.id}`, formData);
                setNotes(notes.map(n => n.id === editingNote.id ? res.data : n));
            } else {
                const res = await axios.post(`${API_URL}/api/notes`, formData);
                setNotes([res.data, ...notes]);
            }
            handleCloseModal();
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            try {
                await axios.delete(`${API_URL}/api/notes/${id}`);
                setNotes(notes.filter(n => n.id !== id));
            } catch (error) {
                console.error('Error deleting note:', error);
                alert('Failed to delete note');
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="notes-page">
            <div className="notes-header">
                <div className="notes-header-left">
                    <h1>My Notes</h1>
                    <p>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</p>
                </div>
                <button className="create-note-btn" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    <span>Create Note</span>
                </button>
            </div>

            {notes.length === 0 ? (
                <div className="empty-notes">
                    <div className="empty-notes-icon">
                        <FileText size={64} />
                    </div>
                    <h3>No notes yet</h3>
                    <p>Create your first note to get started!</p>
                    <button className="create-note-btn" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        <span>Create Your First Note</span>
                    </button>
                </div>
            ) : (
                <div className="notes-grid">
                    {notes.map((note) => (
                        <div key={note.id} className="note-card">
                            <div className="note-card-header">
                                <h3 className="note-card-title">{note.title || 'Untitled'}</h3>
                                <div className="note-card-actions">
                                    <button className="note-action-btn" onClick={() => handleOpenModal(note)}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="note-action-btn delete" onClick={() => handleDelete(note.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="note-card-content">{note.content}</p>
                            <div className="note-card-date">
                                {formatDate(note.updated_at || note.created_at)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="create-note-modal" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingNote ? 'Edit Note' : 'Create New Note'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <form className="modal-form" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Note title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Start writing your note..."
                                rows="10"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                            />
                            <div className="modal-actions">
                                <button type="button" className="modal-btn cancel" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="modal-btn save" disabled={loading}>
                                    {loading ? 'Saving...' : editingNote ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notes;
