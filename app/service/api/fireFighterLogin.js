export const fireFighterLogin = async (fullName, password) => {
  try {
    const response = await fetch(
      "https://thesis-backend-zk2j.onrender.com/fireFighterLogin", // Make sure this is your login route
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // If login failed, throw an error with the backend message
      throw new Error(data.message || "Login failed");
    }

    console.log("Login success:", data);
    return data; // This contains the logged-in user data from backend
  } catch (error) {
    console.error("Login API Error:", error);
    throw error; // This allows your component to handle the alert
  }
};
