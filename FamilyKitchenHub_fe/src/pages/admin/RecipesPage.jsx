import React, { useState, useEffect } from 'react';
import { getAllRecipes, createRecipe, updateRecipe, deleteRecipe, getRecipeCategories, setRecipeCategories, getRecipeSteps, createRecipeStep, updateRecipeStep, deleteRecipeStep, getRecipeIngredients, addRecipeIngredient, updateRecipeIngredient, deleteRecipeIngredient } from '../../service/recipeService';
import { getAllCategories } from '../../service/categoryService';
import { getAllIngredients } from '../../service/ingredientService';
import { toast } from 'react-toastify';
import './RecipesPage.css';
import './RecipesPageExpandable.css';

export default function RecipesPage() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        cookingTimeMinutes: '',
        servings: '',
        totalCalories: '',
        difficultyLevel: 'EASY',
        mealType: 'BREAKFAST'
    });
    const [newRecipe, setNewRecipe] = useState({
        title: '',
        description: '',
        cookingTimeMinutes: '',
        servings: '',
        totalCalories: '',
        difficultyLevel: 'EASY',
        mealType: 'BREAKFAST'
    });
    const [showAddRow, setShowAddRow] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [recipeCategories, setRecipeCategories] = useState([]);
    const [recipeSteps, setRecipeSteps] = useState([]);
    const [recipeIngredients, setRecipeIngredients] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [subLoading, setSubLoading] = useState(false);
    const [editingStepId, setEditingStepId] = useState(null);
    const [editStepText, setEditStepText] = useState('');
    const [newStepText, setNewStepText] = useState('');

    // Ingredient CRUD states
    const [allIngredients, setAllIngredients] = useState([]);
    const [editingIngredientId, setEditingIngredientId] = useState(null);
    const [editIngredientData, setEditIngredientData] = useState({});
    const [newIngredient, setNewIngredient] = useState({
        ingredientId: '',
        quantity: '',
        unit: ''
    });

    useEffect(() => {
        fetchRecipes();
    }, []);

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            const data = await getAllRecipes();
            console.log('Fetched recipes:', data);
            setRecipes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            toast.error('Failed to load recipes');
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (recipe) => {
        setEditingId(recipe.id);
        setEditForm({
            title: recipe.title || '',
            description: recipe.description || '',
            cookingTimeMinutes: recipe.cookingTimeMinutes || '',
            servings: recipe.servings || '',
            totalCalories: recipe.totalCalories || '',
            difficultyLevel: recipe.difficultyLevel || 'EASY',
            mealType: recipe.mealType || 'BREAKFAST'
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({
            title: '',
            description: '',
            cookingTimeMinutes: '',
            servings: '',
            totalCalories: '',
            difficultyLevel: 'EASY',
            mealType: 'BREAKFAST'
        });
    };

    const handleSaveEdit = async (id) => {
        try {
            const dataToSave = {
                ...editForm,
                cookingTimeMinutes: editForm.cookingTimeMinutes ? parseInt(editForm.cookingTimeMinutes) : null,
                servings: editForm.servings ? parseInt(editForm.servings) : null,
                totalCalories: editForm.totalCalories ? parseInt(editForm.totalCalories) : null
            };
            await updateRecipe(id, dataToSave);
            toast.success('Recipe updated successfully!');
            setEditingId(null);
            fetchRecipes();
        } catch (error) {
            console.error('Error updating recipe:', error);
            toast.error('Failed to update recipe');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            try {
                await deleteRecipe(id);
                toast.success('Recipe deleted successfully!');
                fetchRecipes();
            } catch (error) {
                console.error('Error deleting recipe:', error);
                toast.error('Failed to delete recipe');
            }
        }
    };

    const handleAddNew = () => {
        setShowAddRow(true);
        setNewRecipe({
            title: '',
            description: '',
            instructions: '',
            cookingTimeMinutes: '',
            servings: '',
            totalCalories: '',
            difficultyLevel: 'EASY',
            mealType: 'BREAKFAST',
            imageUrl: ''
        });
    };

    const handleCancelAdd = () => {
        setShowAddRow(false);
        setNewRecipe({
            title: '',
            description: '',
            cookingTimeMinutes: '',
            servings: '',
            totalCalories: '',
            difficultyLevel: 'EASY',
            mealType: 'BREAKFAST'
        });
    };

    const handleSaveNew = async () => {
        try {
            const dataToSave = {
                ...newRecipe,
                cookingTimeMinutes: newRecipe.cookingTimeMinutes ? parseInt(newRecipe.cookingTimeMinutes) : null,
                servings: newRecipe.servings ? parseInt(newRecipe.servings) : null,
                totalCalories: newRecipe.totalCalories ? parseInt(newRecipe.totalCalories) : null
            };
            await createRecipe(dataToSave);
            toast.success('Recipe created successfully!');
            setShowAddRow(false);
            setNewRecipe({
                title: '',
                description: '',
                cookingTimeMinutes: '',
                servings: '',
                totalCalories: '',
                difficultyLevel: 'EASY',
                mealType: 'BREAKFAST'
            });
            fetchRecipes();
        } catch (error) {
            console.error('Error creating recipe:', error);
            toast.error('Failed to create recipe');
        }
    };

    const handleToggleExpand = async (recipeId) => {
        if (expandedId === recipeId) {
            // Collapse
            setExpandedId(null);
            setRecipeCategories([]);
            setRecipeSteps([]);
            setRecipeIngredients([]);
        } else {
            // Expand
            setExpandedId(recipeId);
            await Promise.all([
                fetchRecipeCategories(recipeId),
                fetchRecipeSteps(recipeId),
                fetchRecipeIngredients(recipeId),
                fetchAllCategories()
            ]);
        }
    };

    const fetchRecipeCategories = async (recipeId) => {
        try {
            setSubLoading(true);
            const categories = await getRecipeCategories(recipeId);
            setRecipeCategories(categories);
        } catch (error) {
            console.error('Error fetching recipe categories:', error);
        } finally {
            setSubLoading(false);
        }
    };

    const fetchRecipeSteps = async (recipeId) => {
        try {
            const steps = await getRecipeSteps(recipeId);
            setRecipeSteps(steps);
        } catch (error) {
            console.error('Error fetching recipe steps:', error);
        }
    };

    const fetchRecipeIngredients = async (recipeId) => {
        try {
            const ingredients = await getRecipeIngredients(recipeId);
            setRecipeIngredients(ingredients);
        } catch (error) {
            console.error('Error fetching recipe ingredients:', error);
        }
    };

    const fetchAllCategories = async () => {
        try {
            const categories = await getAllCategories();
            setAllCategories(categories);
        } catch (error) {
            console.error('Error fetching all categories:', error);
        }
    };

    const handleToggleCategory = async (recipeId, categoryId, isCurrentlySelected) => {
        try {
            // Get current category IDs (ensure it's an array)
            const currentIds = Array.isArray(recipeCategories) ? recipeCategories.map(c => c.id) : [];
            let newIds;

            if (isCurrentlySelected) {
                // Remove category
                newIds = currentIds.filter(id => id !== categoryId);
            } else {
                // Add category
                newIds = [...currentIds, categoryId];
            }

            await setRecipeCategories(recipeId, newIds);
            toast.success(isCurrentlySelected ? 'Category removed' : 'Category added');

            // Refresh categories
            await fetchRecipeCategories(recipeId);
        } catch (error) {
            console.error('Error toggling category:', error);
            toast.error('Failed to update category');
        }
    };

    const handleAddStep = async (recipeId, description) => {
        try {
            const newOrder = recipeSteps.length + 1;
            await createRecipeStep(recipeId, {
                stepOrder: newOrder,
                description: description
            });
            toast.success('Step added');
            await fetchRecipeSteps(recipeId);
        } catch (error) {
            console.error('Error adding step:', error);
            toast.error('Failed to add step');
        }
    };

    const handleUpdateStep = async (recipeId, stepId, description) => {
        try {
            await updateRecipeStep(recipeId, stepId, { description });
            toast.success('Step updated');
            await fetchRecipeSteps(recipeId);
        } catch (error) {
            console.error('Error updating step:', error);
            toast.error('Failed to update step');
        }
    };

    const handleDeleteStep = async (recipeId, stepId) => {
        if (!window.confirm('Delete this step?')) return;
        try {
            await deleteRecipeStep(recipeId, stepId);
            toast.success('Step deleted');
            await fetchRecipeSteps(recipeId);
        } catch (error) {
            console.error('Error deleting step:', error);
            toast.error('Failed to delete step');
        }
    };

    if (loading) {
        return (
            <div className="recipes-page">
                <div className="loading">Loading recipes...</div>
            </div>
        );
    }

    return (
        <div className="recipes-page">
            <div className="page-header">
                <h2>Recipes Management</h2>
                <button className="btn-primary" onClick={handleAddNew}>
                    + Add New Recipe
                </button>
            </div>

            <div className="recipes-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Cooking Time</th>
                            <th>Servings</th>
                            <th>Calories</th>
                            <th>Difficulty</th>
                            <th>Meal Type</th>
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
                                        value={newRecipe.title}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                                        placeholder="Recipe title"
                                        autoFocus
                                    />
                                </td>
                                <td>
                                    <textarea
                                        className="inline-textarea"
                                        value={newRecipe.description}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
                                        placeholder="Description"
                                        rows="2"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="inline-input-small"
                                        value={newRecipe.cookingTimeMinutes}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, cookingTimeMinutes: e.target.value })}
                                        placeholder="mins"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="inline-input-small"
                                        value={newRecipe.servings}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, servings: e.target.value })}
                                        placeholder="servings"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        className="inline-input-small"
                                        value={newRecipe.totalCalories}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, totalCalories: e.target.value })}
                                        placeholder="cal"
                                    />
                                </td>
                                <td>
                                    <select
                                        className="inline-select"
                                        value={newRecipe.difficultyLevel}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, difficultyLevel: e.target.value })}
                                    >
                                        <option value="EASY">EASY</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HARD">HARD</option>
                                    </select>
                                </td>
                                <td>
                                    <select
                                        className="inline-select"
                                        value={newRecipe.mealType}
                                        onChange={(e) => setNewRecipe({ ...newRecipe, mealType: e.target.value })}
                                    >
                                        <option value="BREAKFAST">BREAKFAST</option>
                                        <option value="LUNCH">LUNCH</option>
                                        <option value="DINNER">DINNER</option>
                                        <option value="SNACK">SNACK</option>
                                    </select>
                                </td>
                                <td>
                                    <button className="btn-save" onClick={handleSaveNew}>
                                        ✓
                                    </button>
                                    <button className="btn-cancel" onClick={handleCancelAdd}>
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        )}

                        {/* Existing Recipes */}
                        {recipes.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="no-data">No recipes found</td>
                            </tr>
                        ) : (
                            recipes.map(recipe => (
                                editingId === recipe.id ? (
                                    // Editing Row
                                    <tr key={recipe.id} className="editing-row">
                                        <td>{recipe.id}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="inline-input"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <textarea
                                                className="inline-textarea"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                rows="2"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="inline-input-small"
                                                value={editForm.cookingTimeMinutes}
                                                onChange={(e) => setEditForm({ ...editForm, cookingTimeMinutes: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="inline-input-small"
                                                value={editForm.servings}
                                                onChange={(e) => setEditForm({ ...editForm, servings: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="inline-input-small"
                                                value={editForm.totalCalories}
                                                onChange={(e) => setEditForm({ ...editForm, totalCalories: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="inline-select"
                                                value={editForm.difficultyLevel}
                                                onChange={(e) => setEditForm({ ...editForm, difficultyLevel: e.target.value })}
                                            >
                                                <option value="EASY">EASY</option>
                                                <option value="MEDIUM">MEDIUM</option>
                                                <option value="HARD">HARD</option>
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="inline-select"
                                                value={editForm.mealType}
                                                onChange={(e) => setEditForm({ ...editForm, mealType: e.target.value })}
                                            >
                                                <option value="BREAKFAST">BREAKFAST</option>
                                                <option value="LUNCH">LUNCH</option>
                                                <option value="DINNER">DINNER</option>
                                                <option value="SNACK">SNACK</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button className="btn-save" onClick={() => handleSaveEdit(recipe.id)}>
                                                ✓
                                            </button>
                                            <button className="btn-cancel" onClick={handleCancelEdit}>
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {/* Display Row */}
                                        <tr key={recipe.id}>
                                            <td>{recipe.id}</td>
                                            <td>{recipe.title}</td>
                                            <td className="text-cell">{recipe.description || '-'}</td>
                                            <td>{recipe.cookingTimeMinutes ? `${recipe.cookingTimeMinutes} min` : '-'}</td>
                                            <td>{recipe.servings || '-'}</td>
                                            <td>{recipe.totalCalories || '-'}</td>
                                            <td>
                                                <span className={`badge badge-${recipe.difficultyLevel?.toLowerCase()}`}>
                                                    {recipe.difficultyLevel || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-meal`}>
                                                    {recipe.mealType || '-'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn-edit" onClick={() => handleEdit(recipe)}>
                                                    ✏️
                                                </button>
                                                <button className="btn-delete" onClick={() => handleDelete(recipe.id)}>
                                                    🗑️
                                                </button>
                                                <button
                                                    className="btn-expand"
                                                    onClick={() => handleToggleExpand(recipe.id)}
                                                    title="Manage Details"
                                                >
                                                    {expandedId === recipe.id ? '▲' : '▼'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expandable Sub-Rows */}
                                        {expandedId === recipe.id && (
                                            <React.Fragment key={`expand-${recipe.id}`}>
                                                {/* Categories Sub-Row */}
                                                <tr className="sub-row categories-row">
                                                    <td colSpan="9">
                                                        <div className="sub-content">
                                                            <strong>📁 Categories:</strong>
                                                            {subLoading ? (
                                                                <span className="loading-text">Loading...</span>
                                                            ) : (
                                                                <div className="categories-manager">
                                                                    {/* Current Categories */}
                                                                    <div className="current-items">
                                                                        {recipeCategories.length > 0 ? (
                                                                            recipeCategories.map(cat => (
                                                                                <span key={cat.id} className="item-badge">
                                                                                    {cat.name}
                                                                                </span>
                                                                            ))
                                                                        ) : (
                                                                            <span className="no-items">No categories assigned</span>
                                                                        )}
                                                                    </div>

                                                                    {/* Category Selection */}
                                                                    <div className="items-selection">
                                                                        <div className="items-list">
                                                                            {allCategories.map(cat => {
                                                                                const isSelected = Array.isArray(recipeCategories) && recipeCategories.some(c => c.id === cat.id);
                                                                                return (
                                                                                    <label key={cat.id} className="item-checkbox">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={isSelected}
                                                                                            onChange={() => handleToggleCategory(recipe.id, cat.id, isSelected)}
                                                                                        />
                                                                                        <span>{cat.name}</span>
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

                                                {/* Steps Sub-Row */}
                                                <tr className="sub-row steps-row">
                                                    <td colSpan="9">
                                                        <div className="sub-content">
                                                            <strong>📝 Steps:</strong>
                                                            <div className="steps-crud">
                                                                {recipeSteps.length > 0 ? (
                                                                    <div className="steps-list-crud">
                                                                        {recipeSteps.map((step) => (
                                                                            <div key={step.id} className="step-item">
                                                                                <span className="step-number">{step.stepOrder}.</span>
                                                                                {editingStepId === step.id ? (
                                                                                    <>
                                                                                        <input
                                                                                            type="text"
                                                                                            className="step-input"
                                                                                            value={editStepText}
                                                                                            onChange={(e) => setEditStepText(e.target.value)}
                                                                                            autoFocus
                                                                                        />
                                                                                        <button
                                                                                            className="btn-step-save"
                                                                                            onClick={() => {
                                                                                                handleUpdateStep(recipe.id, step.id, editStepText);
                                                                                                setEditingStepId(null);
                                                                                            }}
                                                                                        >
                                                                                            ✓
                                                                                        </button>
                                                                                        <button
                                                                                            className="btn-step-cancel"
                                                                                            onClick={() => setEditingStepId(null)}
                                                                                        >
                                                                                            ✕
                                                                                        </button>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <span className="step-text">{step.description}</span>
                                                                                        <div className="step-actions">
                                                                                            <button
                                                                                                className="btn-step-edit"
                                                                                                onClick={() => {
                                                                                                    setEditingStepId(step.id);
                                                                                                    setEditStepText(step.description);
                                                                                                }}
                                                                                            >
                                                                                                ✏️
                                                                                            </button>
                                                                                            <button
                                                                                                className="btn-step-delete"
                                                                                                onClick={() => handleDeleteStep(recipe.id, step.id)}
                                                                                            >
                                                                                                🗑️
                                                                                            </button>
                                                                                        </div>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="no-items">No steps defined</span>
                                                                )}

                                                                {/* Add New Step */}
                                                                <div className="add-step-form">
                                                                    <input
                                                                        type="text"
                                                                        className="step-input"
                                                                        placeholder="Add a new step..."
                                                                        value={newStepText}
                                                                        onChange={(e) => setNewStepText(e.target.value)}
                                                                        onKeyPress={(e) => {
                                                                            if (e.key === 'Enter' && newStepText.trim()) {
                                                                                handleAddStep(recipe.id, newStepText);
                                                                                setNewStepText('');
                                                                            }
                                                                        }}
                                                                    />
                                                                    <button
                                                                        className="btn-add-step"
                                                                        onClick={() => {
                                                                            if (newStepText.trim()) {
                                                                                handleAddStep(recipe.id, newStepText);
                                                                                setNewStepText('');
                                                                            }
                                                                        }}
                                                                        disabled={!newStepText.trim()}
                                                                    >
                                                                        + Add Step
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {/* Ingredients Sub-Row */}
                                                <tr className="sub-row ingredients-row">
                                                    <td colSpan="9">
                                                        <div className="sub-content">
                                                            <strong>🥕 Ingredients:</strong>
                                                            <div className="ingredients-preview">
                                                                {recipeIngredients.length > 0 ? (
                                                                    <div className="ingredients-grid">
                                                                        {recipeIngredients.map((ing, index) => (
                                                                            <div key={ing.ingredientId || index} className="ingredient-item">
                                                                                <span className="ingredient-name">{ing.ingredientName}</span>
                                                                                <span className="ingredient-amount">
                                                                                    {ing.quantity} {ing.unit}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="no-items">No ingredients defined</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
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
