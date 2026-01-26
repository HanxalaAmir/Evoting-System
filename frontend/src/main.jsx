import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import the provider
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>  <-- Removed to prevent double API calls in dev
  <BrowserRouter>
    <AuthProvider>
      {" "}
      {/* Wraps App so Auth state is global */}
      <App />
    </AuthProvider>
  </BrowserRouter>,
  // </React.StrictMode>,
);
