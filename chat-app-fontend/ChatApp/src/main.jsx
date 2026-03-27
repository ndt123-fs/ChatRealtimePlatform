import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import AppRoutes from "./config/route.jsx";
import { Toaster } from "react-hot-toast";
import UseChatContext, { ChatProvider } from "./context/ChatContest.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <BrowserRouter>
    <Toaster position="top-center" />
    <ChatProvider>
      <AppRoutes />
    </ChatProvider>
  </BrowserRouter>,
  // </StrictMode>,
);
