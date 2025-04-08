import calculateMacros from './calc'; // adjust path if needed

describe("calculateMacros", () => {
  it("calculates correctly with kg", () => {
    const result = calculateMacros(70, "kg");
    expect(result).toEqual({
      maintenanceProtein: "112.0",
      maintenanceCarb: "280.0",
      bulkProtein: "140.0",
      bulkCarb: "350.0",
      cutProtein: "154.0",
      cutCarb: "210.0",
    });
  });

  it("calculates correctly with lb", () => {
    const result = calculateMacros(154.3, "lb"); // ~70kg
    expect(result).toEqual({
      maintenanceProtein: "112.0",
      maintenanceCarb: "280.0",
      bulkProtein: "140.0",
      bulkCarb: "349.9",
      cutProtein: "154.0",
      cutCarb: "210.0",
    });
  });

  it("throws error when weight is missing", () => {
    expect(() => calculateMacros(null)).toThrow("Weight is required.");
  });
});
