import React, { useEffect, useState } from "react";
import validatePassword from "./validatePassword";
function Signup({ closePopup }){
        const [message, setMessage] = useState("");
        const [messageType, setMessageType] = useState("");
        const [error, setError] = useState('');
        const [formData, setFormData] = useState({
            username: '',
            email:'',
            password: '',


        });
        const handleChange = (e) => {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        };
        const resetForm = () => {
            setFormData({
                ...formData,
            })
        }
        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!validatePassword(formData.password)) {
                setError('Password must include an uppercase letter, lowercase letter, number, and special character')
                return;
            }

            try{
                const res =  await fetch("https://localhost:8000/signup", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',

                    },
                    body: JSON.stringify(formData)
                });

                const data = await res.json()

                if (res.ok) {
                    console.log("Signup Successful", data);
                    setMessage("Signup Successful!")
                    setMessageType('success');

                    if(closePopup) closePopup();
                }else {
                    console.error("Signup failed:", data.message)
                }

            } catch (error) {
                console.error("Error during signup:", error)
            }
           
    }
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [message])
    return(
        <div className="signup-form">
            <form onSubmit={handleSubmit}>
                <h2>Sign Up</h2>
                <label>Username:</label>
                <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required/>
                <br/>
                <label>Email:</label>
                <input 
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <br/>
                <label>Password:</label>
               
                <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                />
                {message && (
                    <p style={{
                        color: messageType === 'success' ? 'green': 'red',
                        fontWeight: 'bold'
                    }}>
                        {message}
                    </p>
                )}
                <br/>
                <p className="password-note">(Must include uppercase letter, lowercase letter, number, and special character)</p>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}


function Login({ closePopup, userData ,setUserData }) {
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try{
            const res = await fetch("https://localhost:8000/login",{
                method: "POST",
                credentials: "include",
                headers: { 
                    "Content-Type": "application/json"                
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })

            }
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Login Failed");
                return;
            }

            console.log("login successful", data);

            const userRes = await fetch(`https://localhost:8000/user/${formData.username}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "content-type": "application/json",
                },
            });

            const userData = await userRes.json();


            if (!userRes.ok) {
                setError(userData.message || "Failed to fetch user data");
                return;
            }

            setUserData(userData);
            if(closePopup) closePopup();


        } catch (error) {
            setError("Error during login. Please try again.");
            console.error("Error:", error);
        }


        
    };
    return (
        <div className="login-form">
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>
                {message && (
                <p style={{
                    color: messageType === 'success' ? 'green' : 'red',
                    fontWeight: 'bold'
                }}>
                    {message}
                </p>
            )}

                <br/>
                <label>Username:</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <br/>
                <label>Password:</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <br/>
                <button type="submit">Login</button>
            </form>



        </div>
    )

    }


export { Signup, Login };