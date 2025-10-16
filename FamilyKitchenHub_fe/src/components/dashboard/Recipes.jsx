import React from "react";
import "./../../styles/Recipes.css";
import {
  Heart,
  HeartOff,
  Trash2,
  Clock,
  Users,
  ChefHat,
  Tags,
} from "lucide-react";

export default function RecipeDashboard() {
  const recipes = [
    {
      id: 1,
      name: "Chicken Pho",
      desc: "Traditional chicken pho with clear, aromatic broth",
      time: "30 phút",
      people: "4 người",
      cal: "250 cal",
      tags: ["#healthy", "#comfort-food"],
      difficulty: "Medium",
      category: "Main Course",
      favorite: true,
      img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
    },
    {
      id: 2,
      name: "Yang Chow Fried Rice",
      desc: "Mixed fried rice with shrimp, sausage and vegetables",
      time: "30 phút",
      people: "4 người",
      cal: "280 cal",
      tags: ["#quick", "#easy", "#comfort-food"],
      difficulty: "Easy",
      category: "Main Course",
      favorite: false,
      img: "https://images.unsplash.com/photo-1601050690597-dfcbf1d10d30",
    },
  ];

  return (
    <div className="recipe-dashboard">
      {/* Header */}
      <header className="recipe-header">
        <div className="title-wrap">
          <h1>🍽️ Your Favorite Recipes</h1>
          <p>Discover and cook delicious meals for your family.</p>
        </div>
        <button className="add-btn">+ Add Recipe</button>
      </header>

      {/* Search + Filter */}
      <div className="search-area">
        <input
          type="text"
          placeholder="Search recipes or ingredients..."
          className="search-input"
        />
      </div>

      <div className="filter-buttons">
        <button className="active">All</button>
        <button>Breakfast</button>
        <button>Lunch</button>
        <button>Dinner</button>
        <button>Dessert</button>
      </div>

      {/* Recipe Grid */}
      <div className="recipe-grid">
        {recipes.map((r) => (
          <div className="recipe-card" key={r.id}>
            <div className="card-image">
              <img src={r.img} alt={r.name} />
              <span className="category-tag">{r.category}</span>
            </div>
            <div className="card-body">
              <div className="card-header">
                <h3>{r.name}</h3>
                <div className="card-actions">
                  {r.favorite ? (
                    <Heart color="red" size={18} />
                  ) : (
                    <HeartOff size={18} />
                  )}
                  <Trash2 color="gray" size={18} className="delete-icon" />
                </div>
              </div>

              <p className="desc">{r.desc}</p>

              <div className="card-info">
                <span>{r.difficulty}</span>
                <div className="info-icons">
                  <Clock size={16} /> <span>{r.time}</span>
                  <Users size={16} /> <span>{r.people}</span>
                  <ChefHat size={16} /> <span>{r.cal}</span>
                </div>
              </div>

              <div className="card-tags">
                <Tags size={16} />
                {r.tags.map((tag, i) => (
                  <span key={i}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
