import React from "react";
import chatIcon from "../assets/chat.png";
import { useState } from "react";
import toast from "react-hot-toast";
import { createRoomApi, joinRoomApi } from "../services/RoomService";
import UseChatContext from "../context/ChatContest";
import { useNavigate } from "react-router";
import { useEffect } from "react";

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const {
    roomId,

    currentUser,
    connected,
    setRoomId,
    setCurrentUser,

    setConnected,
  } = UseChatContext();
  const navigate = useNavigate();
  const handleFormInputChange = (event) => {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  };
  const validateForm = () => {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Please enter your name or room ID or password.");
      return false;
    }
    return true;
  };
  const joinChat = async () => {
    if (validateForm()) {
      try {
        const response = await joinRoomApi(detail.roomId);
        toast.success("Join room successfully...!");
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);

        setConnected(true);
        navigate("/chat");
      } catch (error) {
        console.dir(error);
        const msg = error.response?.data?.message || "Co loi xay ra !";
        toast.error(msg);
      }
    }
  };
  const createRoom = async () => {
    if (validateForm()) {
      try {
        const token = localStorage.getItem("token"); // 👈 lấy JWT

        const response = await createRoomApi(detail, token);

        console.log(response);

        toast.success("Room created successfully !");

        // join room luôn nếu muốn
        // joinChat();
      } catch (error) {
        const message = error.response?.data?.message || "Có lỗi xảy ra !";
        toast.error(message);
      }
    }
  };
  const getUsernameFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        ),
      );
      return payload.sub;
    } catch {
      return null;
    }
  };

  // Auto fill username từ token
  useEffect(() => {
    const tokenUsername = getUsernameFromToken();
    if (!tokenUsername) {
      toast.error("Bạn chưa đăng nhập!");
      navigate("/login");
      return;
    }
    setDetail((prev) => ({ ...prev, userName: tokenUsername }));
  }, []);
  // const createRoom = async () => {
  //   if (validateForm()) {
  //     console.log(detail);
  //     /*Call api create room backend */
  //     try {
  //       const response = await createRoomApi(detail);
  //       // console.log(response);
  //       toast.success("Room created successfully !");
  //       //join room
  //       // joinChat();
  //     } catch (error) {
  //       // console.dir(error);
  //       const message = error.response?.data?.message || "Co loi xay ra !";
  //       toast.error(message);
  //     }
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className=" p-10 border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded bg-gray-900 shadow">
        <div>
          <img src={chatIcon} className="w-24 mx-auto" />
        </div>

        <h1 className="text-2xl font-semibold text-center ">
          Join Room / Create Room...
        </h1>
        {/*div room */}
        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Your name
          </label>
          <input
            value={detail.userName}
            onChange={handleFormInputChange}
            name="userName"
            placeholder="Enter your name..."
            type="text"
            id="name"
            disabled
            className="w-full bg-gray-600 px-4 py-2 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 "
          />
        </div>
        {/* <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Your password
          </label>
          <input
            onChange={handleFormInputChange}
            name="password"
            placeholder="Enter your password..."
            type="text"
            id="name"
            className="w-full bg-gray-600 px-4 py-2 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 "
          />
        </div> */}
        {/* div id room*/}
        <div className="">
          <label htmlFor="name" className="block font-medium mb-2">
            Room ID / New Room ID
          </label>
          <input
            onChange={handleFormInputChange}
            name="roomId"
            placeholder="Enter your room ID..."
            type="text"
            id="room"
            className="w-full bg-gray-600 px-4 py-2 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* button*/}
          <div className="flex justify-center gap-20 mt-6">
            <button
              onClick={joinChat}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-800 rounded-full"
            >
              Join Room
            </button>

            <button
              onClick={createRoom}
              className="px-3 py-2 bg-orange-500 hover:bg-orange-800 rounded-full"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default JoinCreateChat;
