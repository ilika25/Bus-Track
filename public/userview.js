// user.js

const socket = io(); // Connect to socket.io server

// Initialize the map centered roughly on India with zoom 5
const map = L.map("map").setView([25.5956, 85.0860], 15);

// Add OpenStreetMap tiles with attribution
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

let marker = null; // Will hold the marker for driver's location

// Listen for location updates from the server
socket.on("receiveLocation", ({ lat, lng }) => {
  console.log("Received location:", lat, lng);
  if (marker) {
    // Update marker position
    marker.setLatLng([lat, lng]);
  } else {
    // Create marker if doesn't exist
    marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup("Driver is here")
      .openPopup();
  }

  // Center and zoom map to driver's location
  map.setView([lat, lng], 20);
});
