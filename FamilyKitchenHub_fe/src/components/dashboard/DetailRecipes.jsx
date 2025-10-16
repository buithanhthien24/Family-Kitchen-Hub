import React from "react";
import "./../../styles/DetailRecipes.css";
import { Clock, Users } from "lucide-react";

export default function RecipeDetail() {
  return (
    <div className="recipe-detail-page">
      <button className="back-btn">← Back to Recipes</button>

      {/* Hero Section */}
      <div className="recipe-hero">
        <img
          src="https://th.bing.com/th/id/OIP.vlctIg_WmoleoAiv6jgb6wHaE8?w=347&h=189&c=7&r=0&o=7&cb=12&dpr=1.3&pid=1.7&rm=3"
          alt="Creamy Mushroom Pasta"
          className="recipe-image"
        />
        <div className="recipe-overlay">
          <span className="recipe-tag">Dinner</span>
          <h1>Creamy Mushroom Pasta</h1>
          <div className="recipe-meta">
            <span><Clock size={16} /> 25 min</span>
            <span><Users size={16} /> 4 servings</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="recipe-desc">
        A rich and creamy pasta dish with sautéed mushrooms, garlic, and parmesan cheese.
      </p>

      {/* Action Buttons */}
      <div className="recipe-actions">
        <button className="btn-primary">🍳 Cook Now</button>
        <button className="btn-secondary">🛒 Add to Shopping List</button>
      </div>

      {/* Content Section */}
      <div className="recipe-content">
        {/* Ingredients */}
        <div className="ingredients-card">
          <h2>Ingredients</h2>
          <ul>
            <li><span>Pasta</span> <span className="in-fridge">In Fridge</span></li>
            <li><span>Mushrooms</span> <span className="in-fridge">In Fridge</span></li>
            <li><span>Garlic</span> <span className="in-fridge">In Fridge</span></li>
            <li><span>Heavy Cream</span> <span className="in-fridge">In Fridge</span></li>
            <li><span>Parmesan Cheese</span> <span className="in-fridge">In Fridge</span></li>
            <li><span>Butter</span> <span className="in-fridge">In Fridge</span></li>
          </ul>
        </div>

        {/* Instructions */}
        <div className="instructions-card">
          <h2>Instructions</h2>
          <ol>
            <li>
              Cook pasta according to package instructions until al dente.
              Reserve 1 cup of pasta water before draining.
            </li>
            <li>
              While pasta cooks, heat olive oil and butter in a large pan over medium heat.
            </li>
            <li>
              Add sliced mushrooms and cook for 5–7 minutes until golden brown.
              Add minced garlic and cook for 1 minute.
            </li>
            <li>
              Pour in heavy cream and bring to a gentle simmer. Cook 3–4 minutes until slightly thickened.
            </li>
            <li>
              Add cooked pasta to the sauce with grated parmesan. Toss to combine.
            </li>
            <li>
              Season with salt and pepper. Serve with extra parmesan on top.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
