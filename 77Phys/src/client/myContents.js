import React, { useEffect, useState } from "react";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL
function MyBlogs() {
    const [blogs, setBlogs] = useState([]);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const blogsRes = await fetch(`https://seven7physbe.onrender.com/my-blogs`, {
                    method: "GET",
                    credentials: "include"
                });
                const blogsData = await blogsRes.json();
                setBlogs(Array.isArray(blogsData) ? blogsData : []);

                const favRes = await fetch(`https://seven7physbe.onrender.com/my-favorite-blogs`, {
                    method: "GET",
                    credentials: "include"
                });
                const favData = await favRes.json();
                setFavorites(Array.isArray(favData) ? favData : []);

                setLoading(false);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Failed to load blogs or favorites.");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const fetchComments = async (blogId) => {
        try {
            const res = await fetch(`https://seven7physbe.onrender.com/blogs/${blogId}/comments`);
            if (!res.ok) throw new Error("Failed to fetch comments");
            const data = await res.json();
            setComments(data);
        } catch (err) {
            console.error("Failed to load comments", err);
        }
    };

    const handleBlogClick = async (blog) => {
        setSelectedBlog(blog);
        fetchComments(blog.id);
    };
    const handleRemoveFavorite = async (blogId) => {
        try {
            const res = await fetch(`https://seven7physbe.onrender.com/remove-fav-blog/${blogId}`, {
                method: "DELETE",
                credentials: "include",
            });
    
            const data = await res.json();
            if (res.ok) {
                // Remove blog from favorites list
                setFavorites(favorites.filter(fav => fav.id !== blogId));
                alert("Removed from Favorites");
            } else {
                alert(data.error || "Failed to remove favorite");
            }
        } catch (err) {
            console.error("Error removing favorite:", err);
            alert("Something went wrong");
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Blogs</h1>

            {!selectedBlog ? (
                <>
                    {blogs.length === 0 && favorites.length === 0 ? (
                        <p>No blogs or favorites found.</p>
                    ) : (
                        <>
                            {blogs.length > 0 && (
                                <ul className="space-y-4">
                                    {blogs.map((blog) => (
                                        <li key={blog.id} className="border p-4 rounded shadow">
                                            <button
                                                onClick={() => handleBlogClick(blog)}
                                                className="text-blue-600 hover:underline font-semibold text-lg mb-2 block"
                                            >
                                                </button>
                                            <p className="text-gray-600 text-sm">Published on: {blog.date}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {favorites.length > 0 && (
                                <>
                                    <h2 className="mt-6 text-xl font-bold">Favorites</h2>
                                    <ul className="space-y-4 mt-2">
                                        {favorites.map((blog) => (
                                            <li key={blog.id} className="border p-4 rounded shadow bg-yellow-50">
                                                <button
                                                    onClick={() => handleBlogClick(blog)}
                                                    className="text-yellow-700 hover:underline font-semibold text-lg mb-2 block"
                                                >
                                                    {blog.title}
                                                </button>
                                                <p className="text-gray-600 text-sm">Published on: {blog.date}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </>
                    )}
                </>
            ) : (
                <div className="border p-4 rounded shadow">
                    <h3 className="text-xl font-bold">{selectedBlog.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{selectedBlog.date}</p>
                    <p className="whitespace-pre-wrap my-4">{selectedBlog.body}</p>

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
                        ← Back to My Blogs
                    </button>
                </div>
            )}
        </div>
    );
}




function MyWorkouts() {
    const [workouts, setWorkouts] = useState([]);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    useEffect(() => {
        fetch("https://seven7physbe.onrender.com/my-workouts", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Workout data:", data);
                setWorkouts(Array.isArray(data) ? data : [])
            })

            .catch((err) => console.error("Failed to fetch workouts", err));
            
        
    }, []);
   
    const fetchWorkoutDetails = async (id) => {
        try {
            const res = await fetch(`https://seven7physbe.onrender.com/my-workouts/${id}`, {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Workout not found");
            const data = await res.json();
            setSelectedWorkout(data);
        } catch (err) {
            console.error("Failed to load workout details", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this workout?")) return;

        try {
            const res = await fetch(`https://seven7physbe.onrender.com/my-workouts/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setWorkouts(workouts.filter(w => w.id !== id));
                setSelectedWorkout(null);
            } else {
                throw new Error("Failed to delete workout");
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    return (
        <div className="p-4 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">My Workouts</h2>

            {!selectedWorkout ? (
                <ul className="space-y-2">
                    {workouts.map((workout) => (
                        <li key={workout.id} className="flex justify-between items-center">
                            <button
                                className="text-blue-600 underline"
                                onClick={() => fetchWorkoutDetails(workout.id)}
                            >
                                {workout.date}
                            </button>
                            <button
                                className="text-red-500"
                                onClick={() => handleDelete(workout.id)}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="border p-4 rounded shadow">
                    <h3 className="text-xl font-bold">Workout on {selectedWorkout.date}</h3>
                    <ul className="mt-2">
                        {selectedWorkout.exercises.map((ex, idx) => (
                            <li key={idx}>
                                {ex.name}: {ex.sets} sets × {ex.reps} reps @ {ex.weight} lbs
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={() => setSelectedWorkout(null)}
                            className="text-blue-500 underline"
                        >
                            ← Back to Workout List
                        </button>
                        <button
                            onClick={() => handleDelete(selectedWorkout.id)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export  {MyBlogs, MyWorkouts};
