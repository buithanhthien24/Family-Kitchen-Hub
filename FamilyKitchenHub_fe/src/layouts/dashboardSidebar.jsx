import React, { useEffect, useRef } from "react";
import "../styles/DashboardSidebar.css";
import {
  LayoutDashboard,
  BookOpen,
  Snowflake,
  Trash2,
  LogOut,
  UserRound,
  User,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { label: "Dashboard", path: "/manage/Dashboard", icon: <LayoutDashboard size={18} /> },
  { label: "Recipes", path: "/manage/recipes", icon: <BookOpen size={18} /> },
  { label: "Fridge", path: "/manage/fridge", icon: <Snowflake size={18} /> },
  {
    label: "Profile",
    path: "/manage/familyProfile",
    icon: <UserRound size={18} />,
  },
  { label: "Deleted", path: "/manage/deleted", icon: <Trash2 size={18} /> },
  { label: "Edit Profile", path: "/manage/editprofile", icon: <User size={18} /> },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const indicatorRef = useRef(null);
  const tabsRef = useRef([]);

  useEffect(() => {
    const activeIndex = TABS.findIndex((tab) => tab.path === location.pathname);
    const activeTab = tabsRef.current[activeIndex];

    if (activeTab && indicatorRef.current) {
      const rect = activeTab.getBoundingClientRect();
      const parentRect = activeTab.parentElement.getBoundingClientRect();
      indicatorRef.current.style.top = rect.top - parentRect.top + "px";
      indicatorRef.current.style.height = rect.height + "px";
    }
  }, [location]);



  return (
    <div className="sidebar-tab-switcher-outer">
      <div className="sidebar-tab-switcher">
        {/* indicator (thanh trượt) */}
        <div className="tab-indicator" ref={indicatorRef}></div>

        {TABS.map((tab, i) => (
          <Link
            key={tab.path}
            to={tab.path}
            ref={(el) => (tabsRef.current[i] = el)}
            className={`tab-btn${
              location.pathname === tab.path ? " active" : ""
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        ))}
      </div>


    </div>
  );
}
