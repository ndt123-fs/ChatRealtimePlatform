import React from "react";
import chatIcon from "../assets/chat.png";
import { useState } from "react";
import toast from "react-hot-toast";
import { createRoomApi, joinRoomApi } from "../services/RoomService";
import UseChatContext from "../context/ChatContest";
import { useNavigate } from "react-router";
import { createUserApi } from "../services/UserService";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const createUser = async () => {
    if (validateForm()) {
      //call api create user
      try {
        const response = await createUserApi(user);
        console.log(response);
        toast.success("User created successfully !");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (error) {
        // console.dir(error);
        const message = error.response.data.message || "Co loi xay ra !";
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="p-10 border border-gray-700 w-full max-w-md rounded bg-gray-900 shadow flex flex-col gap-6">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-center text-white">
          Create Account
        </h1>

        {/* Username */}
        <div>
          <label className="block font-medium mb-2 text-gray-200">
            Username
          </label>
          <input
            name="username"
            onChange={FormInputChange}
            type="text"
            placeholder="Enter your username..."
            className="w-full bg-gray-700 px-4 py-2 border border-gray-600 rounded-full 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block font-medium mb-2 text-gray-200">
            Password
          </label>
          <input
            name="password"
            onChange={FormInputChange}
            type="password"
            placeholder="Enter your password..."
            className="w-full bg-gray-700 px-4 py-2 border border-gray-600 rounded-full 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>

        {/* Button */}
        <button
          onClick={createUser}
          className="w-full py-2 bg-green-500 hover:bg-green-700 rounded-full 
                 font-medium transition"
        >
          Sign Up
        </button>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <span className="text-blue-400 cursor-pointer">
            <a href="/">Login</a>
          </span>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;
