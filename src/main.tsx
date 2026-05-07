import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgba(12, 16, 32, 0.85)",
            color: "#e7ecf7",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(14px)",
            borderRadius: "14px",
            fontSize: "13px",
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
