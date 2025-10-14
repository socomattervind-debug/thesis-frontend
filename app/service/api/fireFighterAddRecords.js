export const addFireIncidentRecord = async (recordData) => {
  try {
    const response = await fetch(
      "https://thesis-backend-zk2j.onrender.com/fireFighterAddRecords",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordData),
      }
    );

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      console.error("Non-JSON response from server:", text);
      throw new Error(text || "Server returned invalid response");
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to add record");
    }

    console.log("Record added successfully:", data);
    return data;
  } catch (error) {
    console.error("Add Record API Error:", error);
    throw error;
  }
};
