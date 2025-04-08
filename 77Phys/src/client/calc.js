
export default function calculateMacros(weight, unit = "kg") {
    if (!weight) {
      throw new Error("Weight is required.");
    }
  
    const weightInKg = unit === "lb" ? weight * 0.453592 : weight;
  
    return {
      maintenanceProtein: (weightInKg * 1.6).toFixed(1),
      maintenanceCarb: (weightInKg * 4).toFixed(1),
      bulkProtein: (weightInKg * 2).toFixed(1),
      bulkCarb: (weightInKg * 5).toFixed(1),
      cutProtein: (weightInKg * 2.2).toFixed(1),
      cutCarb: (weightInKg * 3).toFixed(1),
    };
  }
  