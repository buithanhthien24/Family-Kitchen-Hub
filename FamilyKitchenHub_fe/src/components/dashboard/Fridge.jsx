import React, { useState, useEffect } from "react";
import axios from "../../hooks/axios"; // file cấu hình axios riêng
import "./../../styles/FridgeManager.css";
import { Plus, MoreVertical } from "lucide-react";

export default function FridgeManager() {
  const [ingredients, setIngredients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    unit: "",
    nutritionalInfo: "",
  });

  // Lấy token từ localStorage
  const token = localStorage.getItem("token");

  // GET nguyên liệu
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/ingredients", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIngredients(res.data);
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };
    fetchIngredients();
  }, [token]);

  // POST thêm nguyên liệu
  const handleAddIngredient = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8080/api/ingredients",
        newIngredient,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowModal(false);
      setNewIngredient({ name: "", unit: "", nutritionalInfo: "" });
      const res = await axios.get("http://localhost:8080/api/ingredients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIngredients(res.data);
    } catch (error) {
      console.error("Error adding ingredient:", error);
    }
  };

  const getStatus = (expDate) => {
    if (!expDate) return "Fresh";
    const today = new Date();
    const expiry = new Date(expDate);
    const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return "Expired";
    if (diffDays <= 3) return "Expiring Soon";
    return "Fresh";
  };

  return (
    <div className="fridge-manager">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>👋 Welcome to Fridge Manager! Let’s check your fridge today</h1>
          <p>Keep your ingredients fresh and reduce food waste</p>
        </div>
        <img
          src="/images/fridge.png"
          alt="Chibi fridge character"
          className="fridge-icon"
        />
      </div>

      {/* Header */}
      <div className="header">
        <h2>Your Ingredients</h2>
        <button className="btn primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Ingredient
        </button>
      </div>

      {/* Ingredient Grid */}
      <div className="ingredient-grid">
        {ingredients.map((item) => {
          const info = item.nutritionalInfo
            ? JSON.parse(item.nutritionalInfo)
            : {};
          const status = getStatus(item.expiryDate);

          return (
            <div
              key={item.id}
              className={`ingredient-card ${status.toLowerCase().replace(" ", "-")}`}
            >
              <div className="card-header">
                <h3>{item.name}</h3>
                <MoreVertical size={16} />
              </div>
              <p className="info">{item.name}</p>
              <p className="info">{item.unit}</p>
              <div className="nutrition">
                <p className="nutrition-title">Nutrition (per 100g):</p>
                <div className="nutrition-badges">
                  {info.protein && <span>Protein: {info.protein}</span>}
                  {info.fat && <span>Fat: {info.fat}</span>}
                  {info.calories && <span>{info.calories} cal</span>}
                </div>
              </div>

              <div className={`status ${status.toLowerCase().replace(" ", "-")}`}>
                {status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay active">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Ingredient</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                ✖
              </button>
            </div>
            <form className="modal-form" onSubmit={handleAddIngredient}>
              <label>
                Name
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Unit
                <input
                  type="text"
                  value={newIngredient.unit}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, unit: e.target.value })
                  }
                  required
                />
              </label>
              <label>
                Nutritional Info (JSON)
                <input
                  type="text"
                  placeholder='{"fat":"4g","protein":"6g","calories":75}'
                  value={newIngredient.nutritionalInfo}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      nutritionalInfo: e.target.value,
                    })
                  }
                />
              </label>
              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
