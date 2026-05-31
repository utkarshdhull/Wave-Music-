import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AudioPlayerProvider } from "./context/AudioPlayerContext";
import { AuthProvider } from "./context/AuthContext";
import "./styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AudioPlayerProvider>
          <App />
        </AudioPlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
