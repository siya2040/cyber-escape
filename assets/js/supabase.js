// Auto-detect environment: use local port 8080 for development, and the cloud Render URL for production
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:") {
  window.cyberBackendUrl = "http://localhost:8080";
} else {
  // Replace this placeholder with your actual live Render URL after deployment!
  window.cyberBackendUrl = "https://cyber-escape-backend.onrender.com";
}
console.log("Java Spring Boot Backend URL configured to:", window.cyberBackendUrl);