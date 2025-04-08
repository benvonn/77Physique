import React, { useState, useEffect } from "react";
import { Login, Signup } from "./user.js";
import { Blog, SubmitWorkout, BlogList, WorkoutArchive } from "./main.js";
import { MyBlogs, MyWorkouts } from "./myContents.js";

function Navigation() {
    const [activePopup, setActivePopup] = useState(null);
    const [viewMode, setViewMode] = useState("blog");
    const [showExtraButtons, setShowExtraButtons] = useState(false);
    const [workouts, setWorkouts] = useState([]);

    const [userData, setUserData] = useState(null);

    const fetchWorkouts = async () => {
        try {
            const res = await fetch("https://localhost:8000/workouts", {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch workouts");
            const data = await res.json();
            setWorkouts(data);
        } catch (err) {
            console.error("Failed to fetch workouts", err);
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, []);

    const handleNewWorkout = (newWorkout) => {
        setWorkouts((prev) => [newWorkout, ...prev]);
    };

    const showLogin = () => setActivePopup("login");
    const showSignup = () => setActivePopup("signup");
    const showBlogForm = () => setActivePopup("blog");
    const showArchiveForm = () => setActivePopup("archive");
    const closePopup = () => setActivePopup(null);

    const showBlogList = () => {
        setViewMode("blog");
        setActivePopup(null);
    };
    const showWorkoutArchive = () => {
        setViewMode("workout");
        setActivePopup(null);
    };
    const showMyBlogs = () => {
        setViewMode("myblogs");
        setActivePopup(null);
    };
    const showMyWorkouts = () => {
        setViewMode("myworkouts");
        setActivePopup(null);
    };

    const toggleExtraButtons = () => setShowExtraButtons(prev => !prev);

    const handleLogout = async () => {
        try {
            await fetch("https://localhost:8000/logout", {
                method: "POST",
                credentials: "include",
            });
            setUserData(null);
            setActivePopup(null);
        } catch (err) {
            console.error("Logout failed", err);
        }
    };
return(

    <div className="Page">
    <nav className="navbar">
      {/* Welcome Box */}
      <div className="welcome-box">
        {userData && (
          <div className="user-info">
            <h3>Welcome, {userData.username}!</h3>
          </div>
        )}
      </div>
  
      {/* Auth Buttons - Login/Signup */}
      <div className="auth-buttons">
        {!userData && (
          <>
            <button onClick={showLogin}>Login</button>
            <button onClick={showSignup}>Signup</button>
          </>
        )}
        {userData && <button onClick={handleLogout}>Logout</button>}
      </div>
  
      {/* Nav Buttons */}
      <div className="nav-links">
        <button onClick={toggleExtraButtons} className="plus-button">+</button>
  
        {showExtraButtons && (
          <div className="extra-buttons">
            <button onClick={showBlogForm}>New Blog</button>
            <button onClick={showArchiveForm}>New Workout</button>
          </div>
        )}
  
        <div className="view-buttons">
          <button onClick={showBlogList} className={viewMode === "blog" ? "active" : ""}>Blog</button>
          <button onClick={showWorkoutArchive} className={viewMode === "workout" ? "active" : ""}>Archive</button>
          <button onClick={showMyBlogs} className={viewMode === "myblogs" ? "active" : ""}>My Blogs</button>
          <button onClick={showMyWorkouts} className={viewMode === "myworkouts" ? "active" : ""}>My Workouts</button>
        </div>
      </div>
  
      {/* Popups */}
      {activePopup === "login" && (
        <div className="popup">
          <Login closePopup={closePopup} setUserData={setUserData} />
          <button onClick={closePopup}>X</button>
        </div>
      )}
      {activePopup === "signup" && (
        <div className="popup">
          <Signup closePopup={closePopup} />
          <button onClick={closePopup}>X</button>
        </div>
      )}
      {activePopup === "blog" && (
        <div className="popup corner-window">
          <Blog closePopup={closePopup} />
          <button onClick={closePopup}>X</button>
        </div>
      )}
      {activePopup === "archive" && (
        <div className="popup corner-window">
          <SubmitWorkout onNewWorkout={handleNewWorkout} closePopup={closePopup} />
          <button onClick={closePopup}>X</button>
        </div>
      )}
    </nav>
  
    {/* Main Content */}
    <div className="main-content">

      {viewMode === "blog" && <BlogList />}
      {viewMode === "workout" && <WorkoutArchive workouts={workouts} />}
      {viewMode === "myblogs" && <MyBlogs />}
      {viewMode === "myworkouts" && <MyWorkouts />}
    </div>
  </div>
  
)}


export default Navigation;
