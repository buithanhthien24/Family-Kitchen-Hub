import React, { useState, useEffect } from 'react';
import { getAllIngredients, createIngredient, updateIngredient, deleteIngredient, getIngredientTags, addTagsToIngredient, removeTagFromIngredient } from '../../service/ingredientService';
import { getAllTags } from '../../service/tagService';
import { toast } from 'react-toastify';
import './IngredientsPage.css';

export default function IngredientsPage() {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        unit: '',
        caloriesPer100g: '',
        fat: '',
        carbs: '',
        protein: ''
    });
    const [newIngredient, setNewIngredient] = useState({
        name: '',
        unit: '',
        caloriesPer100g: '',
        fat: '',
        carbs: '',
        protein: ''
    });
    const [showAddRow, setShowAddRow] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [ingredientTags, setIngredientTags] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(false);

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            setLoading(true);
            const data = await getAllIngredients();
            console.log('Fetched ingredients:', data);
            setIngredients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
            toast.error('Failed to load ingredients');
            setIngredients([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (ingredient) => {
        setEditingId(ingredient.id);

        let fat = '', carbs = '', protein = '';
        try {
            if (ingredient.nutritionalInfo) {
                const info = JSON.parse(ingredient.nutritionalInfo);
                fat = info.fat !== undefined ? info.fat : '';
                carbs = info.carbs !== undefined ? info.carbs : '';
                protein = info.protein !== undefined ? info.protein : '';
            }
        } catch (e) {
            console.error('Error parsing nutritional info:', e);
        }

        setEditForm({
            name: ingredient.name || '',
            unit: ingredient.unit || '',
            caloriesPer100g: ingredient.caloriesPer100g !== null && ingredient.caloriesPer100g !== undefined ? ingredient.caloriesPer100g : '',
            fat: fat,
            carbs: carbs,
            protein: protein
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({
            name: '',
            unit: '',
            caloriesPer100g: '',
            fat: '',
            carbs: '',
            protein: ''
        });
    };

    const handleSaveEdit = async (id) => {
        // Validate required field
        if (!editForm.name || !editForm.name.trim()) {
            toast.error('Please enter an ingredient name');
            return;
        }
        if (!editForm.unit || !editForm.unit.trim()) {
            toast.error('Please enter a unit');
            return;
        }
        if (!editForm.caloriesPer100g) {
            toast.error('Please enter calories per 100g');
            return;
        }

        try {
            // Construct nutritional info JSON
            const nutritionalInfo = JSON.stringify({
                fat: editForm.fat ? parseFloat(editForm.fat) : 0,
                carbs: editForm.carbs ? parseFloat(editForm.carbs) : 0,
                protein: editForm.protein ? parseFloat(editForm.protein) : 0
            });

            // Convert calories to number
            const dataToSave = {
                name: editForm.name,
                unit: editForm.unit,
                caloriesPer100g: editForm.caloriesPer100g ? parseInt(editForm.caloriesPer100g) : null,
                nutritionalInfo: nutritionalInfo
            };
            await updateIngredient(id, dataToSave);
            toast.success('Ingredient updated successfully!');
            setEditingId(null);
            fetchIngredients();
        } catch (error) {
            console.error('Error updating ingredient:', error);
            toast.error('Failed to update ingredient');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this ingredient?')) {
            try {
                await deleteIngredient(id);
                toast.success('Ingredient deleted successfully!');
                fetchIngredients();
            } catch (error) {
                console.error('Error deleting ingredient:', error);
                toast.error('Failed to delete ingredient');
            }
        }
    };

    const handleAddNew = () => {
        setShowAddRow(true);
        setNewIngredient({
            name: '',
            unit: '',
            caloriesPer100g: '',
            fat: '',
            carbs: '',
            protein: ''
        });
    };

    const handleCancelAdd = () => {
        setShowAddRow(false);
        setNewIngredient({
            name: '',
            unit: '',
            caloriesPer100g: '',
            fat: '',
            carbs: '',
            protein: ''
        });
    };

    const handleSaveNew = async () => {
        // Validate required field
        if (!newIngredient.name || !newIngredient.name.trim()) {
            toast.error('Please enter an ingredient name');
            return;
        }
        if (!newIngredient.unit || !newIngredient.unit.trim()) {
            toast.error('Please enter a unit');
            return;
        }
        if (!newIngredient.caloriesPer100g) {
            toast.error('Please enter calories per 100g');
            return;
        }

        try {
            // Construct nutritional info JSON
            const nutritionalInfo = JSON.stringify({
                fat: newIngredient.fat ? parseFloat(newIngredient.fat) : 0,
                carbs: newIngredient.carbs ? parseFloat(newIngredient.carbs) : 0,
                protein: newIngredient.protein ? parseFloat(newIngredient.protein) : 0
            });

            // Convert calories to number
            const dataToSave = {
                name: newIngredient.name,
                unit: newIngredient.unit,
                caloriesPer100g: newIngredient.caloriesPer100g ? parseInt(newIngredient.caloriesPer100g) : null,
                nutritionalInfo: nutritionalInfo
            };
            await createIngredient(dataToSave);
            toast.success('Ingredient created successfully!');
            setShowAddRow(false);
            setNewIngredient({
                name: '',
                unit: '',
                caloriesPer100g: '',
                fat: '',
                carbs: '',
                protein: ''
            });
            fetchIngredients();
        } catch (error) {
            console.error('Error creating ingredient:', error);
            toast.error('Failed to create ingredient');
        }
    };

    const handleToggleExpand = async (ingredientId) => {
        if (expandedId === ingredientId) {
            // Collapse
            setExpandedId(null);
            setIngredientTags([]);
        } else {
            // Expand
            setExpandedId(ingredientId);
            await fetchIngredientTags(ingredientId);
            await fetchAllTags();
        }
    };

    const fetchIngredientTags = async (ingredientId) => {
        try {
            setTagsLoading(true);
            const tags = await getIngredientTags(ingredientId);
            setIngredientTags(tags);
        } catch (error) {
            console.error('Error fetching ingredient tags:', error);
            toast.error('Failed to load tags');
        } finally {
            setTagsLoading(false);
        }
    };

    const fetchAllTags = async () => {
        try {
            const tags = await getAllTags();
            setAllTags(tags);
        } catch (error) {
            console.error('Error fetching all tags:', error);
        }
    };

    const handleToggleTag = async (ingredientId, tagId, isCurrentlySelected) => {
        try {
            if (isCurrentlySelected) {
                await removeTagFromIngredient(ingredientId, tagId);
                toast.success('Tag removed');
            } else {
                await addTagsToIngredient(ingredientId, [tagId]);
                toast.success('Tag added');
            }
            // Refresh tags
            await fetchIngredientTags(ingredientId);
        } catch (error) {
            console.error('Error toggling tag:', error);
            toast.error('Failed to update tag');
        }
    };

    // Helper function to parse and format nutritional info
    const parseNutritionalInfo = (nutritionalInfo) => {
        if (!nutritionalInfo) return '-';
        try {
            const info = JSON.parse(nutritionalInfo);
            const parts = [];
            if (info.fat !== undefined) parts.push(`Fat: ${info.fat}g`);
            if (info.carbs !== undefined) parts.push(`Carbs: ${info.carbs}g`);
            if (info.protein !== undefined) parts.push(`Protein: ${info.protein}g`);
            return parts.length > 0 ? parts.join(', ') : '-';
        } catch (e) {
            // If not valid JSON, return as-is
            return nutritionalInfo;
        }
    };

    if (loading) {
        return (
            <div className="ingredients-page">
                <div className="loading">Loading ingredients...</div>
            </div>
        );
    }

    return (
        <div className="ingredients-page">
            <div className="page-header">
                <h2>Ingredients Management</h2>
                <button className="btn-primary" onClick={handleAddNew}>
                    + Add New Ingredient
                </button>
            </div>

            <div className="ingredients-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Unit</th>
                            <th>Calories (per 100g)</th>
                            <th>Nutritional Info</th>
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
                                        value={newIngredient.name}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                                        placeholder="Ingredient name"
                                        autoFocus
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="inline-input"
                                        value={newIngredient.unit}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                                        placeholder="e.g., kg, g, liter"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="inline-input"
                                        value={newIngredient.caloriesPer100g}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, caloriesPer100g: e.target.value })}
                                        placeholder="Calories"
                                    />
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '10px', color: '#666', fontWeight: '500' }}>Fat</span>
                                            <input
                                                type="number"
                                                className="inline-input"
                                                value={newIngredient.fat}
                                                onChange={(e) => setNewIngredient({ ...newIngredient, fat: e.target.value })}
                                                style={{ width: '50px' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '10px', color: '#666', fontWeight: '500' }}>Carb</span>
                                            <input
                                                type="number"
                                                className="inline-input"
                                                value={newIngredient.carbs}
                                                onChange={(e) => setNewIngredient({ ...newIngredient, carbs: e.target.value })}
                                                style={{ width: '50px' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '10px', color: '#666', fontWeight: '500' }}>Prot</span>
                                            <input
                                                type="number"
                                                className="inline-input"
                                                value={newIngredient.protein}
                                                onChange={(e) => setNewIngredient({ ...newIngredient, protein: e.target.value })}
                                                style={{ width: '50px' }}
                                            />
                                        </div>
                                    </div>
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

                        {/* Existing Ingredients */}
                        {ingredients.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">No ingredients found</td>
                            </tr>
                        ) : (
                            ingredients.map(ingredient => (
                                editingId === ingredient.id ? (
                                    // Editing Row
                                    <tr key={ingredient.id} className="editing-row">
                                        <td>{ingredient.id}</td>
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
                                                value={editForm.unit}
                                                onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="inline-input"
                                                value={editForm.caloriesPer100g}
                                                onChange={(e) => setEditForm({ ...editForm, caloriesPer100g: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span style={{ fontSize: '10px', color: '#666', fontWeight: '500' }}>Fat</span>
                                                    <input
                                                        type="number"
                                                        className="inline-input"
                                                        value={editForm.fat}
                                                        onChange={(e) => setEditForm({ ...editForm, fat: e.target.value })}
                                                        style={{ width: '50px' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span style={{ fontSize: '10px', color: '#666', fontWeight: '500' }}>Carb</span>
                                                    <input
                                                        type="number"
                                                        className="inline-input"
                                                        value={editForm.carbs}
                                                        onChange={(e) => setEditForm({ ...editForm, carbs: e.target.value })}
                                                        style={{ width: '50px' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <span style={{ fontSize: '10px', color: '#666', fontWeight: '500' }}>Prot</span>
                                                    <input
                                                        type="number"
                                                        className="inline-input"
                                                        value={editForm.protein}
                                                        onChange={(e) => setEditForm({ ...editForm, protein: e.target.value })}
                                                        style={{ width: '50px' }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn-save" onClick={() => handleSaveEdit(ingredient.id)}>
                                                ✓ Save
                                            </button>
                                            <button className="btn-cancel" onClick={handleCancelEdit}>
                                                ✕ Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {/* Display Row */}
                                        <tr key={ingredient.id}>
                                            <td>{ingredient.id}</td>
                                            <td>{ingredient.name}</td>
                                            <td>{ingredient.unit || '-'}</td>
                                            <td>{ingredient.caloriesPer100g || '-'}</td>
                                            <td className="nutritional-info-cell">
                                                {parseNutritionalInfo(ingredient.nutritionalInfo)}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        type="button"
                                                        className="btn-icon btn-edit-icon"
                                                        onClick={() => handleEdit(ingredient)}
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
                                                        onClick={() => handleDelete(ingredient.id)}
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
                                                    <button
                                                        className="btn-expand"
                                                        onClick={() => handleToggleExpand(ingredient.id)}
                                                        title="Manage Tags"
                                                    >
                                                        {expandedId === ingredient.id ? '▲' : '▼'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expandable Tags Row */}
                                        {expandedId === ingredient.id && (
                                            <tr className="sub-row tags-row">
                                                <td colSpan="6">
                                                    <div className="sub-content">
                                                        <strong>🏷️ Tags:</strong>
                                                        {tagsLoading ? (
                                                            <span className="loading-text">Loading tags...</span>
                                                        ) : (
                                                            <div className="tags-manager">
                                                                {/* Current Tags */}
                                                                <div className="current-tags">
                                                                    {ingredientTags.length > 0 ? (
                                                                        ingredientTags.map(tag => (
                                                                            <span key={tag.id} className="tag-badge">
                                                                                {tag.name}
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        <span className="no-tags">No tags assigned</span>
                                                                    )}
                                                                </div>

                                                                {/* Tag Selection */}
                                                                <div className="tags-selection">
                                                                    <div className="tags-list">
                                                                        {allTags.map(tag => {
                                                                            const isSelected = ingredientTags.some(t => t.id === tag.id);
                                                                            return (
                                                                                <label key={tag.id} className="tag-checkbox">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isSelected}
                                                                                        onChange={() => handleToggleTag(ingredient.id, tag.id, isSelected)}
                                                                                    />
                                                                                    <span>{tag.name}</span>
                                                                                </label>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
