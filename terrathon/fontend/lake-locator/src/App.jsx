import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import lakesData from "./assets/lakes.json";
import "./App.css";
import logo from "./assets/logo.png"; // Import the logo
import background from "./assets/background.png"; // Import the background image

const BACKEND_URL = "http://127.0.0.1:8000/api/coordinates/";

// Fuzzy matching using Levenshtein Distance
const levenshteinDistance = (a, b) => {
  const m = a.length;
  const n = b.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
};

// Find the closest lake name
const findClosestLake = (query) => {
  let bestMatch = null;
  let minDistance = Infinity;

  lakesData.forEach((lake) => {
    const lakeName = lake["Lake Name"].toLowerCase();
    const distance = levenshteinDistance(query.toLowerCase(), lakeName);
    if (distance < minDistance) {
      minDistance = distance;
      bestMatch = lake;
    }
  });

  return bestMatch;
};

// Function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

function App() {
  const [searchType, setSearchType] = useState("lake");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [correctedLake, setCorrectedLake] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [nearestLakes, setNearestLakes] = useState([]);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchTypeChange = (type) => {
    setSearchType(type);
    setLocation("");
    setLatitude(null);
    setLongitude(null);
    setCorrectedLake(null);
    setLocationSuggestions([]);
    setError(null);
    setNearestLakes([]);
  };

  // Handle lake search with fuzzy matching
  const handleLakeSearch = (query) => {
    setLocation(query);
    if (query.length < 2) {
      setCorrectedLake(null);
      return;
    }

    const bestMatch = findClosestLake(query);
    if (bestMatch) {
      setCorrectedLake(bestMatch);
    }
  };

  const fetchLakeCoordinates = () => {
    if (correctedLake) {
      const [lat, lon] = correctedLake["Latitude and Longitude"].split(",").map(Number);
      setLatitude(lat);
      setLongitude(lon);
      sendCoordinatesToBackend(lat, lon, correctedLake["Lake Name"]);
    }
  };

  // Fetch location suggestions from OpenStreetMap
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) return setLocationSuggestions([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&countrycodes=IN&q=${query}`
      );
      const data = await response.json();
      setLocationSuggestions(data);
    } catch (error) {
      setError("Failed to fetch location suggestions.");
      console.error("Error fetching suggestions:", error);
    }
  };

  const selectLocation = (place) => {
    setLocation(place.display_name);
    setLatitude(parseFloat(place.lat));
    setLongitude(parseFloat(place.lon));
    setLocationSuggestions([]);
    sendCoordinatesToBackend(place.lat, place.lon, place.display_name);
  };

  const fetchUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          sendCoordinatesToBackend(position.coords.latitude, position.coords.longitude, "User's Location");
        },
        (error) => {
          setError("Error fetching your location. Please ensure location access is enabled.");
          console.error("Error fetching location:", error);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  // Send coordinates to Django backend
  const sendCoordinatesToBackend = async (lat, lon, locationName) => {
    console.log("📡 Sending data:", { latitude: lat, longitude: lon, location_name: locationName });

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          location_name: locationName,
        }),
      });

      console.log("🔄 Response Status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to send data to the backend.");
      }

      const result = await response.json();
      console.log("✅ Backend response:", result);

      // Update nearestLakes state with the data returned from the backend
      if (result.nearest_lakes) {
        setNearestLakes(result.nearest_lakes);
      }
    } catch (error) {
      console.error("❌ Error sending data to backend:", error);
    }
  };

  return (
    <div className="app-container">
      {/* Background Image with Fade Effect */}
      <div
        className="background-image"
        style={{ opacity: 1 - scrollPosition / 500 }}
      ></div>

      {/* Centered Content */}
      <div className="centered-content">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-brand">
            <img src={logo} alt="Logo" className="navbar-logo" /> {/* Add the logo */}
            <div className="navbar-title">AIqua</div>
          </div>
          <ul className="navbar-links">
            <li><a href="#search">Search</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </nav>

        {/* Search Section */}
        <section id="search" className="search-section">
          <h1>Find Lake Coordinates</h1>

          {/* Search Type Options */}
          <div className="search-type">
            <label>
              <input
                type="radio"
                value="lake"
                checked={searchType === "lake"}
                onChange={() => handleSearchTypeChange("lake")}
              />
              Enter Lake Name
            </label>
            <label>
              <input
                type="radio"
                value="location"
                checked={searchType === "location"}
                onChange={() => handleSearchTypeChange("location")}
              />
              Enter Location
            </label>
          </div>

          {/* Lake Name Input */}
          {searchType === "lake" && (
            <>
              <input
                type="text"
                placeholder="Enter lake name"
                value={location}
                onChange={(e) => handleLakeSearch(e.target.value)}
              />
              {correctedLake && (
                <p>
                  Did you mean <strong>{correctedLake["Lake Name"]}</strong>?
                  <br />
                  <br />
                  <button onClick={fetchLakeCoordinates}>Fetch Coordinates</button>
                </p>
              )}
            </>
          )}

          {/* Location Search Input with Dropdown */}
          {searchType === "location" && (
            <>
              <input
                type="text"
                placeholder="Enter your city or area"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  fetchLocationSuggestions(e.target.value);
                }}
              />
              {locationSuggestions.length > 0 && (
                <select onChange={(e) => selectLocation(locationSuggestions[e.target.selectedIndex])}>
                  {locationSuggestions.map((place, index) => (
                    <option key={index} value={place.display_name}>
                      {place.display_name}
                    </option>
                  ))}
                </select>
              )}
              <button onClick={fetchUserLocation}>Fetch My Location</button>
            </>
          )}

          {/* Display Latitude & Longitude */}
          {latitude && longitude && (
            <p>
              <strong>Latitude:</strong> {latitude}, <strong>Longitude:</strong> {longitude}
            </p>
          )}

          {/* Display Error */}
          {error && <p className="error">{error}</p>}
        </section>

        {/* Nearest Lakes Section */}
        {nearestLakes.length > 0 && (
          <section className="nearest-lakes-section">
            <h2>Nearest Lakes</h2>
            <table>
              <thead>
                <tr>
                  <th>Lake Name</th>
                  <th>Distance (km)</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                </tr>
              </thead>
              <tbody>
                {nearestLakes.map((lake, index) => (
                  <tr key={index}>
                    <td>{lake.name}</td>
                    <td>{lake.distance.toFixed(2)}</td>
                    <td>{lake.latitude}</td>
                    <td>{lake.longitude}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Map Section */}
        <section id="map" className="map-section">
          <MapContainer center={[latitude || 20.5937, longitude || 78.9629]} zoom={12} style={{ height: "400px", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {latitude && longitude && <Marker position={[latitude, longitude]}><Popup>{location}</Popup></Marker>}
          </MapContainer>
        </section>

        {/* About Section */}
        <section id="about" className="about-section">
          <h2>About the Project</h2>
          <p>
            Lakes are among the most vital ecosystems on our planet. They support biodiversity, provide drinking water, sustain local economies, and play a crucial role in maintaining ecological balance. However, in recent years, lakes worldwide have faced increasing threats from pollution, climate change, and human activities. These challenges have led to the degradation of water quality, loss of aquatic life, and disruption of ecosystems.
          </p>
          <p>
            Traditional methods of monitoring lake health are often inaccessible, expensive, or lack real-time insights. This makes it difficult for communities, policymakers, and environmental organizations to take timely and effective action. Without accurate data and actionable insights, the preservation and restoration of lakes remain a significant challenge.
          </p>
          <p>
            <strong>Our Solution:</strong>
            <br />
            This project aims to address these challenges by providing a <strong>data-driven platform</strong> for monitoring, analyzing, and preserving lakes. Using advanced technologies, including real-time data collection, predictive analytics, and user-friendly tools, we empower individuals, communities, and organizations to take proactive steps toward lake conservation.
          </p>
          <p>
            <strong>Key Features:</strong>
            <ul>
              <li>Real-time monitoring of water quality parameters such as pH, temperature, and dissolved oxygen.</li>
              <li>Predictive analytics to forecast future ecological health and identify potential risks.</li>
              <li>Actionable recommendations for sustainable lake management and pollution control.</li>
              <li>Interactive maps and visualizations to explore lake data and trends.</li>
              <li>Accessible tools for common users to contribute to environmental preservation efforts.</li>
            </ul>
          </p>
          <p>
            Together, we can create a future where lakes thrive as healthy ecosystems, benefiting both nature and society. Join us in our mission to protect and restore these invaluable natural resources.
          </p>
        </section>
      </div>
    </div>
  );
}

export default App;