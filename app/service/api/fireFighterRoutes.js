export const getCoordinates = async () => {
  try {
    const response = await fetch(
      "https://thesis-backend-zk2j.onrender.com/fireFighterRoutes",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch coordinates");
    }

    const data = await response.json();
    console.log("API response data:", data);

    // ✅ If array → kunin latest (last element)
    const route = Array.isArray(data) ? data[data.length - 1] : data;

    // ✅ Return only origin & destination
    return {
      origin: {
        latitude: route.origin.latitude,
        longitude: route.origin.longitude,
      },
      destination: {
        latitude: route.destination.latitude,
        longitude: route.destination.longitude,
      },
    };
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
