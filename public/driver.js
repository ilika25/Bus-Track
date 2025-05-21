// driver.js

const socket = io(); // Connect to socket.io server

let watchid = null;

document.getElementById("start").onclick = () => {
  if (watchid === null) {
    watchid = navigator.geolocation.watchPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;

        // Send location to server
        socket.emit("sendLocation", { lat: latitude, lng: longitude });
      },
      (err) => {
        console.error("Error getting location:", err);
      },
      { enableHighAccuracy: true }
    );

    document.getElementById("start").disabled = true;
    document.getElementById("stop").disabled = false;
  }
};

document.getElementById("stop").onclick = () => {
  if (watchid !== null) {
    navigator.geolocation.clearWatch(watchid);
    watchid = null;

    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
  }
};
