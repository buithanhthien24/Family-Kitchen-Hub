// ...existing code...
import React, { useState } from "react";
import "../../styles/FridgeManager.css";
import { MoreVertical, Edit2, Trash2, RefreshCw, Plus, X } from "lucide-react";

const initialIngredients = [
  {
    name: "Chicken Breast",
    quantity: "500g",
    category: "Meat",
    location: "Main Fridge",
    expiry: "Dec 28, 2024",
    status: "Expiring Soon",
    icon: "🍗",
    expiredDays: 286,
  },
  {
    name: "Fresh Milk",
    quantity: "1L",
    category: "Dairy",
    location: "Main Fridge",
    expiry: "Dec 25, 2024",
    status: "Expired",
    icon: "🥛",
    expiredDays: 290,
  },
  {
    name: "Broccoli",
    quantity: "300g",
    category: "Vegetables",
    location: "Crisper Drawer",
    expiry: "Jan 5, 2025",
    status: "Fresh",
    icon: "🥦",
    expiredDays: 0,
  },
  {
    name: "Eggs",
    quantity: "12 pcs",
    category: "Dairy",
    location: "Main Fridge",
    expiry: "Jan 10, 2025",
    status: "Fresh",
    icon: "🥚",
    expiredDays: 0,
  },
  {
    name: "Tomatoes",
    quantity: "6 pcs",
    category: "Vegetables",
    location: "Main Fridge",
    expiry: "Jan 2, 2025",
    status: "Expiring Soon",
    icon: "🍅",
    expiredDays: 0,
  },
  {
    name: "Butter",
    quantity: "200g",
    category: "Dairy",
    location: "Main Fridge",
    expiry: "Jan 20, 2025",
    status: "Fresh",
    icon: "🧈",
    expiredDays: 0,
  },
];

const statusInfo = {
  Fresh: {
    class: "status-fresh",
    icon: "✅",
    text: "Fresh",
  },
  "Expiring Soon": {
    class: "status-expiring",
    icon: "⚠️",
    text: "Expiring Soon",
  },
  Expired: {
    class: "status-expired",
    icon: "⛔",
    text: "Expired",
  },
};

export default function FridgeManager() {
  const [menuIndex, setMenuIndex] = useState(null);
  const [items, setItems] = useState(initialIngredients);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("quick"); // 'quick' | 'custom'

  // form fields
  const [quickName, setQuickName] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("Main Fridge");
  const [expiry, setExpiry] = useState("");

  // prevent background scroll when modal open
  React.useEffect(() => {
    if (isModalOpen) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
  }, [isModalOpen]);

  // Đóng menu khi click ra ngoài
  React.useEffect(() => {
    const close = () => setMenuIndex(null);
    if (menuIndex !== null) {
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }
  }, [menuIndex]);

  function openModal(tab = "quick") {
    setActiveTab(tab);
    setIsModalOpen(true);
    // reset fields
    setQuickName("");
    setName("");
    setQuantity("");
    setCategory("");
    setLocation("Main Fridge");
    setExpiry("");
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  function formatExpiry(dateStr) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  }

  function handleAddQuick(e) {
    e.preventDefault();
    if (!quickName.trim()) return alert("Enter item name");
    const newItem = {
      name: quickName.trim(),
      quantity: "",
      category: "",
      location: "Main Fridge",
      expiry: "",
      status: "Fresh",
      icon: "🧾",
      expiredDays: 0,
    };
    setItems((s) => [newItem, ...s]);
    closeModal();
  }

  function handleAddCustom(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Ingredient name required");
    const formattedExpiry = formatExpiry(expiry);
    // determine status simple: expired if date in past, expiring soon if within 3 days
    let status = "Fresh";
    if (expiry) {
      const d = new Date(expiry);
      const now = new Date();
      const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
      if (diff < 0) status = "Expired";
      else if (diff <= 3) status = "Expiring Soon";
    }
    const newItem = {
      name: name.trim(),
      quantity: quantity.trim(),
      category: category.trim(),
      location,
      expiry: formattedExpiry,
      status,
      icon: "", // user can add later
      expiredDays: status === "Expired" ? Math.abs(Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24))) : 0,
    };
    setItems((s) => [newItem, ...s]);
    closeModal();
  }

  return (
    <div className="fridge-manager fridge-bg">
      {/* Header Section */}
      <div className="fridge-hero-row">
        <div className="fridge-hero-left">
          <div className="fridge-hero-title">
            <span role="img" aria-label="wave" className="fridge-hero-emoji">
              👋
            </span>
            <span className="fridge-hero-hi">
              Hi Huy! Let's check your fridge today
            </span>
          </div>
          <div className="fridge-hero-desc">
            Keep your ingredients fresh and reduce food waste
          </div>
        </div>
        <div className="fridge-hero-right">
          <img
            src="https://cdn-icons-png.flaticon.com/512/1046/1046857.png"
            alt="Chibi fridge character"
            className="fridge-hero-img"
          />
        </div>
      </div>

      {/* Alert */}
      <div className="alert-box-card">
        <span style={{ marginRight: 8 }}>
          ⚠️<span style={{ color: "#facc15", marginLeft: 2 }}>▲</span>
        </span>
        <div>
          <b>
            You have 1 expired item.
            <br />2 items are expiring soon.
          </b>
        </div>
      </div>

      {/* Header row */}
      <div className="fridge-header-row">
        <h2>Your Ingredients</h2>
        <button className="add-btn-card" onClick={() => openModal("custom")}>
          <Plus size={18} style={{ marginRight: 6 }} /> Add Ingredient
        </button>
      </div>

      {/* Card Grid */}
      <div className="ingredient-card-grid">
        {items.map((item, idx) => (
          <div
            className="ingredient-card styled-card"
            key={idx}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-top-row">
              <div className="ingredient-icon-circle">
                <span className="ingredient-icon">{item.icon || "🍽️"}</span>
              </div>
              <div className="card-menu-wrap">
                <button
                  className="card-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuIndex(menuIndex === idx ? null : idx);
                  }}
                >
                  <MoreVertical size={20} />
                </button>
                {menuIndex === idx && (
                  <div className="card-menu-dropdown styled-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button className="dropdown-item">
                      <Edit2 size={16} style={{ marginRight: 8 }} /> Edit
                    </button>
                    <button className="dropdown-item">
                      <RefreshCw size={16} style={{ marginRight: 8 }} /> Update expiry
                    </button>
                    <button className="dropdown-item delete">
                      <Trash2 size={16} style={{ marginRight: 8 }} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="ingredient-name">{item.name}</div>
            <div className="ingredient-qty">{item.quantity}</div>
            <div className="ingredient-info">
              <div>
                <span className="info-label">Category:</span>{" "}
                <b>{item.category}</b>
              </div>
              <div>
                <span className="info-label">Location:</span>{" "}
                <b>{item.location}</b>
              </div>
              <div className="expiry-row">
                <span className="info-label">Expires:</span>
                <span className="expiry-badge">{item.expiry}</span>
              </div>
            </div>
            <div
              className={`ingredient-status ${statusInfo[item.status].class}`}
            >
              {statusInfo[item.status].text}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Ingredient</h3>
              <button className="modal-close" onClick={closeModal}><X size={18} /></button>
            </div>

            <div className="modal-tabs">
              <button className={`tab ${activeTab === "quick" ? "active" : ""}`} onClick={() => setActiveTab("quick")}>Quick Add</button>
              <button className={`tab ${activeTab === "custom" ? "active" : ""}`} onClick={() => setActiveTab("custom")}>Custom Entry</button>
            </div>

            {activeTab === "quick" ? (
              <form className="modal-form" onSubmit={handleAddQuick}>
                <label>Ingredient Name</label>
                <input value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder="e.g., Fresh Salmon" />
                <button className="btn-primary" type="submit">Add to Fridge</button>
              </form>
            ) : (
              <form className="modal-form" onSubmit={handleAddCustom}>
                <div className="form-grid">
                  <div>
                    <label>Ingredient Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Fresh Salmon" />
                  </div>
                  <div>
                    <label>Quantity</label>
                    <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="e.g., 500g, 2 pcs, 1L" />
                  </div>
                  <div>
                    <label>Category</label>
                    <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Dairy" />
                  </div>
                  <div>
                    <label>Expiry Date</label>
                    <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label>Location</label>
                  <select value={location} onChange={(e) => setLocation(e.target.value)}>
                    <option>Main Fridge</option>
                    <option>Freezer</option>
                    <option>Crisper Drawer</option>
                  </select>
                </div>

                <button className="btn-primary" type="submit" style={{ marginTop: 18 }}>Add to Fridge</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
// ...existing code...