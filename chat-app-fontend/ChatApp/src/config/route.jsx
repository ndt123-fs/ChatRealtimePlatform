import { Route, Routes } from "react-router";
import App from "../App";
import "../index.css";
import ChatPage from "../components/ChatPage";
import RegisterPage from "../components/RegisterPage";
import LoginPage from "../components/LoginPage";
const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/room" element={<App />} />
      </Routes>
    </div>
  );
};
export default AppRoutes;
