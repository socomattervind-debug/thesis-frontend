export const getFireIncidentRecords = async () => {
  try {
    const response = await fetch(
      "https://thesis-backend-zk2j.onrender.com/fireFighterAddRecords", // 👈 GET endpoint
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch records");
    }

    const data = await response.json();
    console.log("Fetched records:", data);
    return data;
  } catch (error) {
    console.error("Get Records API Error:", error);
    throw error;
  }
};
