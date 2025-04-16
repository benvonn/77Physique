import React, { useEffect, useState } from "react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

function Blog({closePopup, onNewPost}){
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [ formData, setFormData ] = useState({
        title : '',
        date : '',
        blogBody: '',
        user_id: '',
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            const res = await fetch(`https://seven7physbe.onrender.com/submitBlog`, {
                //mode: 'no-cors',
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json()

            if (res.ok){
                console.log("Blog Submitted", data);
                setMessage("Blog Submitted");
                setMessageType("Success")
                setFormData({title: "", content: ""})
                onNewPost();
                closePopup();

            } else {
                console.error("Unable to submit", data.message)
                const err = await res.json();
                setMessage(err.message || "Submission failed");
                setMessageType("error");
            }
        } catch (error) {
            console.error("Error during submission", error)
        }
    }
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);
    return(
        <div className="blogForm">
            <form onSubmit={handleSubmit}>
                <h2>Submit Blog?</h2>
                <label>Title:</label>
                <input 
                type="text"
                name="title"
                onChange={handleChange}
                value={formData.title}
                required/>

                <label>Date:</label>
                <input 
                type="date"
                name="date"
                onChange={handleChange}
                value={formData.date}
                required/>
                <br/>
                <label>Body:</label>
                <textarea
                onChange={handleChange}
                name="blogBody"
                value={formData.blogBody}
                required
                rows={10}/>

                {message && (
                    <p style={{
                        color: messageType === "success" ? "green" : "red",
                        fontWeight: "bold"
                    }}>
                        {message}
                    </p>
                )}

                <button type="submit">Submit</button>
            </form>
        </div>
    )
}
function BlogList(){
    const [blogs, setBlogs] = useState([]);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [flashMessage, setFlashMessage] = useState("");
    const [favoriteIds, setFavoriteIds] = useState([]);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const blogRes = await fetch(`https://seven7physbe.onrender.com/blogs`, {
                    method: "GET",
                    credentials: "include",
                });
                const blogData = await blogRes.json();
                setBlogs(Array.isArray(blogData) ? blogData : []);
    
                const favRes = await fetch(`https://seven7physbe.onrender.com/my-favorite-blogs`, {
                    method: "GET",
                    credentials: "include",
                });
                const favData = await favRes.json();
                if (Array.isArray(favData)) {
                    setFavoriteIds(favData.map(blog => blog.id));
                }
    
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
    
        fetchData();
    }, []);
    

    const fetchBlogDetails = async (id) => {
        try {
            const res = await fetch(`https://seven7physbe.onrender.com/blogs/${id}`);
            if (!res.ok) throw new Error("Blog not found");
            const data = await res.json();
            setSelectedBlog(data);
            fetchComments(id)
        } catch (err) {
            console.error("Failed to load blog details", err);
        }
    };
    const fetchComments = async (blogId) => {
    try{
        const res = await fetch(`https://seven7physbe.onrender.com/blogs/${blogId}/comments`);
        if (!res.ok) throw new Error("Failed to fetch comments");
        const data = await res.json();
        setComments(data);
    } catch (err) {
        console.error("Failed to load comments", err);
    }
}
const handleFavorite = async (blogId) => {
    try {
        const res = await fetch(`https://seven7physbe.onrender.com/fav-blog`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ blog_id: blogId }),
        });

        const data = await res.json();
        if (res.ok) {
            setFavoriteIds([...favoriteIds, blogId]);
            setFlashMessage("Added to Favorites");
            setTimeout(() => setFlashMessage(""), 4000);
        } else {
            setFlashMessage(data.error || "Failed to add");
        }
    } catch (err) {
        console.error("Error favoriting blog:", err);
        setFlashMessage("Something went wrong");
    }
};
    const handleRemoveFavorite = async (blogId) => {
        try {
            const res = await fetch(`https://seven7physbe.onrender.com/remove-fav-blog/${blogId}`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await res.json();
            if (res.ok) {
                setFavoriteIds(favoriteIds.filter(id => id !== blogId));
                setFlashMessage("Removed from Favorites");
                setTimeout(() => setFlashMessage(""), 4000);
            } else {
                setFlashMessage(data.error || "Failed to remove");
            }
        } catch (err) {
            console.error("Error removing favorite:", err);
            setFlashMessage("Something went wrong");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`https://seven7physbe.onrender.com/blogs/${selectedBlog.id}/comments`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (res.ok) {
                const added = await res.json();
                setComments([...comments, added]);
                setNewComment("");
            } else {
                const err = await res.json();
                alert(err.error || "Failed to post comment");
            }
        } catch (err) {
            console.error("Error submitting comment:", err);
            alert("Something went wrong");
        }
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <section className="intro-summary">
                <p className="Intro-summary">Welcome to 77Physique! This is a tool to network and help you on your path to be a better you! Please note, Things affect and work differently so what is effective for someone else maybe ineffective on you. Don't be discouraged!
                    Learning about your body is the best part! Cut yourself some slack, and keep trying. It's one step at a time!
                </p>
                <br></br>
            </section>
            <h2 className="text-2xl font-bold mb-4">Blogs</h2>

            {!selectedBlog ? (
                <ul className="space-y-2">
                {Array.isArray(blogs) ? (
                  blogs.map((blog) => (
                    <li key={blog.id}>
                      <button onClick={() => fetchBlogDetails(blog.id)}>
                        {blog.title}
                      </button>
                    </li>
                  ))
                ) : (
                  <p>No blogs available.</p>
                )}
              </ul>
              
            ) : (
                <div className="border p-4 rounded shadow">
                    <h3 className="text-xl font-bold">{selectedBlog.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{selectedBlog.date} by {selectedBlog.author}</p>
                    {flashMessage && (
                        <div className="mb-4 p-2 rounded bg-green-100 text-green-800 font-medium">
                            {flashMessage}
                        </div>
                    )}

                    {favoriteIds.includes(selectedBlog.id) ? (
                        <button
                            onClick={() => handleRemoveFavorite(selectedBlog.id)}
                            className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded hover:bg-yellow-200 transition"
                        >
                            💔 Remove from Favorites
                        </button>
                    ) : (
                        <button
                            onClick={() => handleFavorite(selectedBlog.id)}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition"
                        >
                            ❤️ Add to Favorites
                        </button>
                    )}

                    <p className="whitespace-pre-wrap my-4">{selectedBlog.body}</p>

                    {/* Comments Section */}
                    <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-2">Comments</h4>
                        <ul className="space-y-2 mb-4">
                            {comments.map((comment) => (
                                <li key={comment.id} className="bg-gray-100 p-2 rounded">
                                    <p className="text-sm">{comment.content}</p>
                                    <span className="text-xs text-gray-500">– {comment.author || "Anonymous"}</span>
                                </li>
                            ))}
                        </ul>

                        <form onSubmit={handleCommentSubmit} className="space-y-2">
                            <textarea
                                className="w-full border rounded p-2"
                                rows={3}
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                            >
                                Post Comment
                            </button>
                        </form>
                    </div>

                    <button
                        onClick={() => setSelectedBlog(null)}
                        className="mt-6 text-blue-500 underline block"
                    >
                        ← Back to Blog List
                    </button>
                </div>
            )}
        </div>
    );
}



function SubmitWorkout({ setWorkoutList , closePopup}) {
    const [exercise, setExercise] = useState({ name: "", sets: "", reps: "", weight: "" });
    const [exercises, setExercises] = useState([]);
    const [date, setDate] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const addExercise = () => {
        const trimmedName = exercise.name.trim();
        if (trimmedName && exercise.sets && exercise.reps && exercise.weight) {
            setExercises(prev => [...prev, { ...exercise, name: trimmedName }]);
            setExercise({ name: "", sets: "", reps: "", weight: "" });
            setErrorMessage("");
        } else {
            setErrorMessage("Please fill in all fields before adding an exercise.");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setExercise(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = (index) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const submitWorkout = async () => {
        if (!date || exercises.length === 0) {
            setErrorMessage("Please select a date and add at least one exercise.");
            return;
        }

        const payload = {
            date,
            exercises: exercises.map(ex => ({
                name: ex.name,
                sets: parseInt(ex.sets),
                reps: parseInt(ex.reps),
                weight: parseInt(ex.weight),
            })),
        };

        try {
            const res = await fetch(`https://seven7physbe.onrender.com/create-workout`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to submit workout");

            const newWorkout = await res.json(); 


            if (setWorkoutList) {
                setWorkoutList(prev => [...prev, newWorkout]);
            }

            if (res.ok) {
            alert("Workout created successfully!");
            setExercises([]);
            if(closePopup) closePopup();
            setMessage("Workout Saved")
            setMessageType("Success")
            setDate("");
            setErrorMessage("");
            } else {
                const err = await res.json();
                setMessage(err.message || "Submission failed")
                setMessageType("Error")

            }
        } catch (error) {
            console.error(error);
            setErrorMessage("Error submitting workout. Please try again.");
        }
    };
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(""), 4000);
            return () => clearTimeout(timer);
        }
    }, [message])

    return (
        <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Add Exercises</h2>
            {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}

            <input
                type="text"
                name="name"
                value={exercise.name}
                onChange={handleInputChange}
                placeholder="Exercise Name"
                className="w-full p-2 border rounded mb-2"
            />
            <input
                type="number"
                name="sets"
                value={exercise.sets}
                onChange={handleInputChange}
                placeholder="Sets"
                className="w-full p-2 border rounded mb-2"
            />
            <input
                type="number"
                name="reps"
                value={exercise.reps}
                onChange={handleInputChange}
                placeholder="Reps"
                className="w-full p-2 border rounded mb-2"
            />
            <input
                type="number"
                name="weight"
                value={exercise.weight}
                onChange={handleInputChange}
                placeholder="Weight (lbs)"
                className="w-full p-2 border rounded mb-2"
            />
            <button
                onClick={addExercise}
                className="bg-blue-500 text-white p-2 rounded w-full mb-4"
            >
                Add Exercise
            </button>

            <h3 className="text-lg font-semibold">Workout Date</h3>
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded mb-4"
            />

            <h3 className="text-lg font-semibold">Exercises List</h3>
            <ul className="mb-4">
                {exercises.map((ex, index) => (
                    <li key={index} className="border-b p-2 flex justify-between items-center">
                        <span>
                            {ex.name} - {ex.sets} sets x {ex.reps} reps ({ex.weight} lbs)
                        </span>
                        <button
                            onClick={() => handleDelete(index)}
                            className="ml-2 text-red-500"
                        >
                            X
                        </button>
                    </li>
                ))}
            </ul>
            {message && (
                <p style={{
                    color: messageType === "success" ? "green" : "red",
                    fontWeight: "bold"
                }}>
                    {message}
                </p>
            )}

            <button
                onClick={submitWorkout}
                className="bg-green-500 text-white p-2 rounded w-full"
            >
                Create Workout
            </button>
        </div>
    );
}



function WorkoutArchive() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userArchives, setUserArchives] = useState([]);

    // Fetch all users who have archived workouts
    useEffect(() => {
        fetch(`https://seven7physbe.onrender.com/archive`, {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => setUsers(data))
            .catch((err) => console.error("Failed to fetch users", err));
    }, []);

    // Fetch selected user's workouts
    const fetchUserArchives = async (userId) => {
        try {
            const res = await fetch(`https://seven7physbe.onrender.com/archive/${userId}`, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to load archives");
            const data = await res.json();
            setUserArchives(data);
            setSelectedUser(userId);
        } catch (err) {
            console.error("Failed to load archives", err);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            {!selectedUser ? (
                <>
                    <h2 className="text-xl font-bold mb-4">Select a User</h2>
                    <ul className="space-y-2">
                        {users.map((user) => (
                            <li key={user.id}>
                                <button
                                    className="text-blue-600 underline"
                                    onClick={() => fetchUserArchives(user.id)}
                                >
                                    {user.username}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <>
                    <h2 className="text-xl font-bold mb-4">Workouts for {users.find(u => u.id === selectedUser)?.username}</h2>
                    <ul className="space-y-4">
                        {userArchives.map((workout, index) => (
                            <li key={index} className="border p-4 rounded shadow">
                                <h3 className="font-semibold mb-2">Date: {new Date(workout.date).toLocaleDateString()}</h3>

                                <ul>
                                    {workout.exercises.map((ex, idx) => (
                                        <li key={idx}>
                                            {ex.name}: {ex.sets} sets × {ex.reps} reps @ {ex.weight} lbs
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => {
                            setSelectedUser(null);
                            setUserArchives([]);
                        }}
                        className="mt-4 text-blue-500 underline"
                    >
                        ← Back to User List
                    </button>
                </>
            )}
        </div>
    );
}

export { SubmitWorkout,Blog, BlogList, WorkoutArchive };