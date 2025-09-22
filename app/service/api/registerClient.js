export const registerClient = async (clientData) => {
  try {
    const response = await fetch(
      "https://thesis-backend-zk2j.onrender.com/userClient",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clientData),
      }
    );

    const data = await response.json();
    return data; // ito ang ire-return sa component mo
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
