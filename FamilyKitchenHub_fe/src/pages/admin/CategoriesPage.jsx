import React, { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../service/categoryService';
import { toast } from 'react-toastify';
import './CategoriesPage.css';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: ''
    });
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: ''
    });
    const [showAddRow, setShowAddRow] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getAllCategories();
            console.log('Fetched categories:', data);
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setEditForm({
            name: category.name || '',
            description: category.description || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({
            name: '',
            description: ''
        });
    };

    const handleSaveEdit = async (id) => {
        // Validate required field
        if (!editForm.name || !editForm.name.trim()) {
            toast.error('Please enter a category name');
            return;
        }

        try {
            await updateCategory(id, editForm);
            toast.success('Category updated successfully!');
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Failed to update category');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(id);
                toast.success('Category deleted successfully!');
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category');
            }
        }
    };

    const handleAddNew = () => {
        setShowAddRow(true);
        setNewCategory({
            name: '',
            description: ''
        });
    };

    const handleCancelAdd = () => {
        setShowAddRow(false);
        setNewCategory({
            name: '',
            description: ''
        });
    };

    const handleSaveNew = async () => {
        // Validate required field
        if (!newCategory.name || !newCategory.name.trim()) {
            toast.error('Please enter a category name');
            return;
        }

        try {
            await createCategory(newCategory);
            toast.success('Category created successfully!');
            setShowAddRow(false);
            setNewCategory({
                name: '',
                description: ''
            });
            fetchCategories();
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error('Failed to create category');
        }
    };

    if (loading) {
        return (
            <div className="categories-page">
                <div className="loading">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="categories-page">
            <div className="page-header">
                <h2>Categories Management</h2>
                <button className="btn-primary" onClick={handleAddNew}>
                    + Add New Category
                </button>
            </div>

            <div className="categories-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
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
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        placeholder="Category name"
                                        autoFocus
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="inline-input"
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
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

                        {/* Existing Categories */}
                        {categories.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="no-data">No categories found</td>
                            </tr>
                        ) : (
                            categories.map(category => (
                                editingId === category.id ? (
                                    // Editing Row
                                    <tr key={category.id} className="editing-row">
                                        <td>{category.id}</td>
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
                                            <input
                                                type="text"
                                                className="inline-input"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <button className="btn-save" onClick={() => handleSaveEdit(category.id)}>
                                                ✓ Save
                                            </button>
                                            <button className="btn-cancel" onClick={handleCancelEdit}>
                                                ✕ Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    // Display Row
                                    <tr key={category.id}>
                                        <td>{category.id}</td>
                                        <td>{category.name}</td>
                                        <td>{category.description || '-'}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    type="button"
                                                    className="btn-icon btn-edit-icon"
                                                    onClick={() => handleEdit(category)}
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
                                                    onClick={() => handleDelete(category.id)}
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
