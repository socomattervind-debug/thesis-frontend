export const registerFireFighter = async (fireFighterData) => {
  try {
    const response = await fetch(
      "https://thesis-backend-zk2j.onrender.com/fireFighter",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fireFighterData),
      }
    );

    const data = await response.json();
    return data; // ito ang ire-return sa component mo
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
