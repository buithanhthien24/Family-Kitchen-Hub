import React, { useEffect, useRef, useState } from "react";
import "../styles/DashboardSidebar.css";
import {
  LayoutDashboard,
  BookOpen,
  Snowflake,
  LogOut,
  UserRound,
  User,
  HomeIcon,
  ChevronDown,
  UtensilsCrossed,
  Bell,
  AlertCircle
} from "lucide-react";
import axios from "../hooks/axios";
import dayjs from "dayjs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isValidJWT } from "../utils/security";

const TABS = [
  { label: "Home", path: "/home", icon: <HomeIcon size={18} /> },
  {
    label: "Recommend",
    path: "/manage/Dashboard",
    icon: <UtensilsCrossed size={18} />,
  },
  { label: "Recipes", path: "/manage/recipes", icon: <BookOpen size={18} /> },
  { label: "Fridge", path: "/manage/fridge", icon: <Snowflake size={18} /> },
  {
    label: "Members",
    path: "/manage/familyProfile",
    icon: <UserRound size={18} />,
  },
  { label: "Profile", icon: <User size={20} />, icon2: <ChevronDown size={12} />, dropdown: true }

];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const indicatorRef = useRef(null);
  const tabsRef = useRef([]);
  const sidebarRef = useRef(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [expiringItems, setExpiringItems] = useState([]);
  const notificationRef = useRef(null);

  // Update indicator
  useEffect(() => {
    const activeIndex = TABS.findIndex((tab) =>
      tab.path === '/home'
        ? location.pathname === tab.path
        : location.pathname.startsWith(tab.path)
    );
    const activeTab = tabsRef.current[activeIndex];

    if (activeTab && indicatorRef.current) {
      const rect = activeTab.getBoundingClientRect();
      const parentRect = activeTab.parentElement.getBoundingClientRect();
      indicatorRef.current.style.top = rect.top - parentRect.top + "px";
      indicatorRef.current.style.height = rect.height + "px";
    }
  }, [location]);

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    // Validate token immediately
    if (token && !isValidJWT(token)) {
      console.warn("Sidebar: Token invalid, logging out.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUser(null);
      return;
    }

    if (userData && token) {
      try {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData)); // chuyển chuỗi JSON thành object
      } catch (error) {
        console.error("Invalid user data in localStorage");
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      // If token invalid/missing but we consider them logged in (or have stale data)
      // Perform cleanup
      if (localStorage.getItem("token") || localStorage.getItem("user")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);


  // Close dropdown when click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpenDropdownIndex(null);
      }

      // Close notifications when clicking outside
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch expiring ingredients
  useEffect(() => {
    const fetchExpiringIngredients = async () => {
      if (!isLoggedIn || !user) return;

      try {
        const res = await axios.get(`/inventory/user/${user.id}`);
        const ingredients = res.data || [];

        // Filter items expiring in <= 3 days
        const today = dayjs();
        const expiring = ingredients.filter(item => {
          if (!item.expirationDate) return false;
          const expDate = dayjs(item.expirationDate);
          const diffDays = expDate.diff(today, 'day');
          return diffDays <= 3 && diffDays >= -1; // Include expired items too (up to -1 day for robustness)
        });

        // Sort by expiration date (soonest first)
        expiring.sort((a, b) => dayjs(a.expirationDate).diff(dayjs(b.expirationDate)));

        setExpiringItems(expiring);
      } catch (error) {
        console.error("Error fetching expiring ingredients:", error);
      }
    };

    fetchExpiringIngredients();

    // Refresh every 5 minutes
    const interval = setInterval(fetchExpiringIngredients, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoggedIn, user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setOpenDropdownIndex(null);
    navigate("/home");
  };

  return (
    <div className="sidebar-tab-switcher-outer" ref={sidebarRef}>
      <div className="sidebar-tab-switcher">
        {/* Indicator */}
        <div className="tab-indicator" ref={indicatorRef}></div>



        {TABS.map((tab, i) => {
          if (tab.dropdown) {
            return (
              <div
                key={i}
                className={`pf-tab-wrapper ${openDropdownIndex === i ? "open" : ""}`}
                ref={(el) => (tabsRef.current[i] = el)}
              >
                <div
                  className="pf-tab-inner"
                  onClick={() =>
                    setOpenDropdownIndex(openDropdownIndex === i ? null : i)
                  }
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.icon2 && <span className="pf-tab-icon2">{tab.icon2}</span>} {/* icon thứ 2 */}
                </div>

                <div
                  className={`pf-dropdown-menu ${openDropdownIndex === i ? "open" : ""
                    }`}
                >
                  {isLoggedIn ? (
                    <>
                      <div className="pf-dropdown-item"> {user?.fullName || user?.username || "User"}</div>
                      <Link
                        className="pf-dropdown-item pf-dropdown-editprofile"
                        to="/manage/editprofile"
                      >
                        <User size={16} /> Edit Profile
                      </Link>
                      <div
                        className="pf-dropdown-item pf-logout-btn"
                        onClick={handleLogout}
                      >
                        <LogOut size={16} /> Logout
                      </div>



                    </>
                  ) : (
                    <Link className="pf-dropdown-item" to="/login">
                      <User size={16} /> Login
                    </Link>
                  )}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={tab.path}
              to={tab.path}
              ref={(el) => (tabsRef.current[i] = el)}
              className={`tab-btn${(tab.path === '/home'
                ? location.pathname === tab.path
                : location.pathname.startsWith(tab.path)) ? " active" : ""
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </Link>
          );
        })}
                {/* NOTIFICATION BELL */}
        {isLoggedIn && (
          <div className="notification-wrapper" ref={notificationRef}>
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <Bell size={20} />
              {expiringItems.length > 0 && (
                <div className="notification-badge">{expiringItems.length}</div>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <span>Sắp hết hạn ({expiringItems.length})</span>
                </div>
                <div className="notification-list">
                  {expiringItems.length > 0 ? (
                    expiringItems.map((item, index) => {
                      const expDate = dayjs(item.expirationDate);
                      const diffDays = expDate.diff(dayjs(), 'day');
                      const isExpired = diffDays < 0;

                      return (
                        <div key={index} className="notification-item">
                          <AlertCircle size={22} className="notif-icon" />
                          <div className="notif-content">
                            <div className="notif-title">{item.ingredientName}</div>
                            <div className="notif-time">
                              {isExpired
                                ? "Đã hết hạn!"
                                : diffDays === 0
                                  ? "Hết hạn hôm nay"
                                  : `Hết hạn sau ${diffDays} ngày`}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-notifications">
                      Không có nguyên liệu nào sắp hết hạn.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
