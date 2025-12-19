import React, { useState, useEffect } from 'react';
import { getAllTags, createTag, updateTag, deleteTag } from '../../service/tagService';
import { toast } from 'react-toastify';
import './TagsPage.css';

export default function TagsPage() {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        type: 'CATEGORY',
        description: ''
    });
    const [newTag, setNewTag] = useState({
        name: '',
        type: 'CATEGORY',
        description: ''
    });
    const [showAddRow, setShowAddRow] = useState(false);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const data = await getAllTags();
            console.log('Fetched tags:', data);
            setTags(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching tags:', error);
            toast.error('Failed to load tags');
            setTags([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (tag) => {
        setEditingId(tag.id);
        setEditForm({
            name: tag.name || '',
            type: tag.type || 'CATEGORY',
            description: tag.description || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({
            name: '',
            type: 'CATEGORY',
            description: ''
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            await updateTag(id, editForm);
            toast.success('Tag updated successfully!');
            setEditingId(null);
            fetchTags();
        } catch (error) {
            console.error('Error updating tag:', error);
            toast.error('Failed to update tag');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tag?')) {
            try {
                await deleteTag(id);
                toast.success('Tag deleted successfully!');
                fetchTags();
            } catch (error) {
                console.error('Error deleting tag:', error);
                toast.error('Failed to delete tag');
            }
        }
    };

    const handleAddNew = () => {
        setShowAddRow(true);
        setNewTag({
            name: '',
            type: 'CATEGORY',
            description: ''
        });
    };

    const handleCancelAdd = () => {
        setShowAddRow(false);
        setNewTag({
            name: '',
            type: 'CATEGORY',
            description: ''
        });
    };

    const handleSaveNew = async () => {
        try {
            await createTag(newTag);
            toast.success('Tag created successfully!');
            setShowAddRow(false);
            setNewTag({
                name: '',
                type: 'CATEGORY',
                description: ''
            });
            fetchTags();
        } catch (error) {
            console.error('Error creating tag:', error);
            toast.error('Failed to create tag');
        }
    };

    if (loading) {
        return (
            <div className="tags-page">
                <div className="loading">Loading tags...</div>
            </div>
        );
    }

    return (
        <div className="tags-page">
            <div className="page-header">
                <h2>Tags Management</h2>
                <button className="btn-primary" onClick={handleAddNew}>
                    + Add New Tag
                </button>
            </div>

            <div className="tags-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Add New Row */}
                        {showAddRow && (
                            <tr className="editing-row">
                                <td>-</td>
                                <td>
                                    <input
                                        type="text"
                                        className="inline-input"
                                        value={newTag.name}
                                        onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                                        placeholder="Tag name"
                                        autoFocus
                                    />
                                </td>
                                <td>
                                    <select
                                        className="inline-select"
                                        value={newTag.type}
                                        onChange={(e) => setNewTag({ ...newTag, type: e.target.value })}
                                    >
                                        <option value="CATEGORY">CATEGORY</option>
                                        <option value="PRESERVATION">PRESERVATION</option>
                                        <option value="NUTRITION">NUTRITION</option>
                                        <option value="USAGE">USAGE</option>
                                    </select>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="inline-input"
                                        value={newTag.description}
                                        onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                                        placeholder="Description"
                                    />
                                </td>
                                <td>
                                    <button className="btn-save" onClick={handleSaveNew}>
                                        ✓ Save
                                    </button>
                                    <button className="btn-cancel" onClick={handleCancelAdd}>
                                        ✕ Cancel
                                    </button>
                                </td>
                            </tr>
                        )}

                        {/* Existing Tags */}
                        {tags.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="no-data">No tags found</td>
                            </tr>
                        ) : (
                            tags.map(tag => (
                                editingId === tag.id ? (
                                    // Editing Row
                                    <tr key={tag.id} className="editing-row">
                                        <td>{tag.id}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="inline-input"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                autoFocus
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="inline-select"
                                                value={editForm.type}
                                                onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                            >
                                                <option value="CATEGORY">CATEGORY</option>
                                                <option value="PRESERVATION">PRESERVATION</option>
                                                <option value="NUTRITION">NUTRITION</option>
                                                <option value="USAGE">USAGE</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="inline-input"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <button className="btn-save" onClick={() => handleSaveEdit(tag.id)}>
                                                ✓ Save
                                            </button>
                                            <button className="btn-cancel" onClick={handleCancelEdit}>
                                                ✕ Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    // Display Row
                                    <tr key={tag.id}>
                                        <td>{tag.id}</td>
                                        <td>{tag.name}</td>
                                        <td>
                                            {tag.type ? (
                                                <span className={`tag-type ${tag.type.toLowerCase()}`}>
                                                    {tag.type}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#95a5a6' }}>No Type</span>
                                            )}
                                        </td>
                                        <td>{tag.description || '-'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    type="button"
                                                    className="btn-icon btn-edit-icon"
                                                    onClick={() => handleEdit(tag)}
                                                    title="Sửa"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                                                        <path d="M15 5l4 4"></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-icon btn-delete-icon"
                                                    onClick={() => handleDelete(tag.id)}
                                                    title="Xóa"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18"></path>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        <path d="M10 11v6"></path>
                                                        <path d="M14 11v6"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
