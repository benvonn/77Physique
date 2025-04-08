
import React, { useState, useEffect } from "react";
import Calculator from "./client/calculator";
import { Blog,  SubmitWorkout} from "./client/main";  
import Navigation from "./client/nav";
import "./App.css";

function App() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            // Simulate delay — replace this with your actual fetch logic
            await new Promise((res) => setTimeout(res, 1500)); // e.g. wait 1.5 sec
            setLoading(false);
        };

        fetchInitialData();
    }, []);
    return (
        <div className="Page">
                <h1 className="title">77 Physique</h1>
            {loading ? (
                <div className="loading-screen">
                    <div className="spinner" />
                    <p>Eating while I load everything...</p>
                </div>
            ) : (
                <>
                    <div className="Cotent-container">
                        <div className="blogForm-container" hidden>
                            <Blog />
                        </div>
                        <div className="archiveForm-Container" hidden></div>
                    </div>

                    <div className="calc-container">
                        <Calculator />
                    </div>

                    <div className="navbar">
                        <Navigation>
                            <SubmitWorkout />
                        </Navigation>
                    </div>
                </>
            )}
        </div>
    );
}

export default App