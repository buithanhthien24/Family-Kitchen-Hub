import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import ManageLayouts from "./pages/ManagesLayout";
import Recipes from "./components/dashboard/Recipes";
import Fridge from "./components/dashboard/Fridge";
import DetailRecipes from "./components/dashboard/DetailRecipes";
import "./App.css";
import FamilyProfiles from "./components/dashboard/FamilyProfile";
import MealPlanner from "./components/dashboard/MealPlaner";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmail from "./pages/VerifyEmail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <BrowserRouter>
     <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        
        {/* Dùng MainLayout làm layout chính */}
        <Route path="/" element={<MainLayout />}>
          {/* Các trang con hiển thị trong <Outlet /> */}
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage/>} />
          <Route path="verify-email" element={<VerifyEmail />} />
          
        </Route>
        {/* Dùng ManageLayouts cho các trang quản lý */}
        <Route path="/manage/*" element={<ManageLayouts />}>
          {/* Các trang con quản lý */}
          {/* <Route path='/' index element={<div>Manage Dashboard</div>} /> */}
          <Route path="fridge" element={<Fridge />} />
          <Route path="recipes" element={<Recipes/>} />
          <Route path="detailRecipes" element={<DetailRecipes />} />
          <Route path="familyProfile" element={<FamilyProfiles/>} />
           <Route path="mealPlaner" element={<MealPlanner/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
