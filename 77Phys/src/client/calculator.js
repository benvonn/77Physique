import { useState, useEffect } from "react";
import calculateMacros from "./calc";

export default function Calculator() {
    const [weight, setWeight] = useState("");
    const [unit, setUnit] = useState("kg");
    const [results, setResults] = useState({
        maintenanceProtein: "---",
        maintenanceCarb: "---",
        bulkProtein: "---",
        bulkCarb: "---",
        cutProtein: "---",
        cutCarb: "---",
    });

    useEffect(() => {
        try {
            if (weight) {
                const res = calculateMacros(weight, unit);
                setResults(res);
            }
        } catch (err) {
            console.log(err);
        }
    }, [weight, unit]);


    return (
    <div className="floating-calculator">
        <div className="calculator" id="forum">
            <div className="grey-text-note">
                <p>This is just a tool, not the solution. It can't replace a professional!(Protein is on the left, and Carbs is on the right)</p>
            </div>
            <section id="weight-forum">
                <label className="calculator-label">Enter your weight:</label>
                <input 
                    type="number" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)} 
                    placeholder="Enter weight" 
                />

                <label className="calculator-label">Unit of Measurement</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="kg">KG</option>
                    <option value="lb">LB</option>
                </select>
            </section>
g
            <section id="calcResult">
                <p>Your maintenance is: 
                    <span> {results.maintenanceProtein}g </span>
                    <span> {results.maintenanceCarb}g</span>
                </p>
                <p>To bulk (gain) weight:
                    <span> {results.bulkProtein}g </span>
                    <span> {results.bulkCarb}g </span>
                </p>
                <p>To cut (lose) weight:
                    <span> {results.cutProtein}g </span>
                    <span> {results.cutCarb}g </span>
                </p>
            </section>
        </div>
        </div>
    );
}
//Proteing is weight(kg) times 2
//Carb is weight(kg) times 4 (main)