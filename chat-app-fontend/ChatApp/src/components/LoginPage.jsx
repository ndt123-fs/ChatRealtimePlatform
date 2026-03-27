import React from "react";
import chatIcon from "../assets/chat.png";
import { useState } from "react";
import toast from "react-hot-toast";
import { createRoomApi, joinRoomApi } from "../services/RoomService";
import UseChatContext from "../context/ChatContest";
import { useNavigate } from "react-router";
import { createUserApi } from "../services/UserService";
import { createLogin } from "../services/AuthService";

const LoginPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const FormInputChange = (event) => {
    setUser({
      ...user,
      [event.target.name]: event.target.value,
    });
  };
  const validateForm = () => {
    if (user.username === "" || user.password === "") {
      toast.error("Please enter your name or password !");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (validateForm()) {
      //call api create login
      try {
        const response = await createLogin(user);
        console.log(response);

        const jwt = response.accessToken;
        localStorage.setItem("token", jwt);
        console.log(jwt);

        toast.success("Login successfully !");

        setTimeout(() => {
          navigate("/room");
        }, 2000);
      } catch (error) {
        console.dir(error);
        const message = error.response.data.message || "Co loi xay ra !";
        toast.error(message);
      }
    }
  };

  return (
    // Background cực tối (Slate 950) để làm nổi bật Card
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans p-4">
      {/* Card: Màu Slate 900, bo tròn đậm, đổ bóng */}
      <div className="bg-slate-900 border border-slate-800 p-10 w-full max-w-md rounded-3xl shadow-2xl flex flex-col gap-8 transform transition-all duration-300 hover:scale-[1.01]">
        {/* Header: Logo & Title */}
        <div className="text-center">
          <img
            src={chatIcon}
            className="w-20 mx-auto mb-5 drop-shadow-md"
            alt="logo"
          />
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Wellcome Back!
          </h1>
          <p className="text-slate-400 mt-2">
            Đăng nhập để kết nối với mọi người.
          </p>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-6">
          {/* Username Input */}
          <div className="relative">
            <label className="text-sm font-medium text-slate-300 mb-1.5 block">
              Tên đăng nhập
            </label>
            <input
              name="username"
              onChange={FormInputChange}
              type="text"
              placeholder="Nhập username của bạn..."
              // CSS: Slate 800, viền Slate 700, Focus viền xanh dương
              className="w-full bg-slate-800/60 px-5 py-3.5 border border-slate-700/50 rounded-2xl 
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                       text-white placeholder-slate-500 transition-all duration-200"
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-slate-300 block">
                Mật khẩu
              </label>
              <a
                href="#"
                className="text-xs text-blue-500 hover:text-blue-400 transition"
              >
                Quên mật khẩu?
              </a>
            </div>
            <input
              name="password"
              onChange={FormInputChange}
              type="password" // Hiển thị dấu sao
              placeholder="Nhập mật khẩu của bạn..."
              className="w-full bg-slate-800/60 px-5 py-3.5 border border-slate-700/50 rounded-2xl 
                       focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600
                       text-white placeholder-slate-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Nút Login: Màu Xanh Dương đậm, bo tròn hoàn toàn */}
        <button
          onClick={handleLogin}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-md shadow-sm transition duration-200 active:scale-95 flex items-center justify-center gap-2"
        >
          Đăng nhập
        </button>
        {/* Footer: Chuyển sang đăng ký */}
        <div className="text-center text-slate-500 text-sm mt-2 border-t border-slate-800 pt-6">
          Bạn chưa có tài khoản?{" "}
          <span
            className="text-blue-500 font-medium cursor-pointer hover:text-blue-400 transition"
            onClick={() => navigate("/register")}
          >
            Đăng ký ngay
          </span>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
