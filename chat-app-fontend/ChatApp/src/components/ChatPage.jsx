import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import UseChatContext from "../context/ChatContest";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { baseUrl } from "../config/AxioisHelper";
import { Stomp } from "@stomp/stompjs";
import { getMessageApi } from "../services/RoomService";
import ndt from "../assets/ndt.jpg";
import { formatTime } from "../config/FormatTime";
import { uploadFileApi } from "../services/UploadFileService";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import EmojiPicker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";

const ChatPage = () => {
  const chatEndRef = useRef(null);

  const [typingUser, setTypingUser] = useState(null);

  const {
    roomId,

    currentUser,

    connected,

    setRoomId,

    setCurrentUser,

    setConnected,
  } = UseChatContext();

  const navigate = useNavigate();

  const [zoomImage, setZoomImage] = useState(null);
  const normalize = (s) => (s ?? "").trim().toLowerCase();

  useEffect(() => {
    if (!connected) {
      navigate("/");
    }
  }, [connected, roomId, currentUser, setConnected]);

  const [selectedFile, setSelectedFile] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const inputRef = useRef(null);

  const chatBoxRef = useRef(null);

  const [stompClient, setStompClient] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);
  // send with icon

  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  //click outside

  const emojiRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // nếu click KHÔNG nằm trong emoji picker

      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await getMessageApi(roomId);

        // console.log(response);

        setMessages(response);
      } catch (error) {}
    }

    if (connected) {
      loadMessages();
    }
  }, []);
  useEffect(() => {
    console.log("onlineUsers:", onlineUsers);
  }, [onlineUsers]);
  useEffect(() => {
    if (!connected || !roomId) return;

    const sock = new SockJS(`${baseUrl}chat`);

    const client = Stomp.over(sock);
    client.debug = () => {}; // ✅ tắt debug log

    const token = localStorage.getItem("token");

    client.connect({ Authorization: `Bearer ${token}` }, () => {
      console.log("STOMP CONNECTED");
      setStompClient(client);
      //subscribe
      client.subscribe(`/topic/room/${roomId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages((prev) => [...prev, newMessage]);
      });
      client.subscribe(`/topic/typing/${roomId}`, (message) => {
        const data = JSON.parse(message.body);
        // console.log(
        //   "typing nhận:",
        //   data.sender,
        //   "| tôi là:",
        //   currentUserRef.current,
        // ); // ✅ check
        if (data.sender !== currentUserRef.current) {
          setTypingUser(data.sender);
          setTimeout(() => setTypingUser(null), 2000);
        }
      });
      //subscribe status
      client.subscribe(`/topic/room/${roomId}/status`, (msg) => {
        const data = JSON.parse(msg.body);

        if (data.status === "ONLINE") {
          setOnlineUsers((prev) => {
            const user = normalize(data.user);

            if (prev.map(normalize).includes(user)) return prev;

            return [...prev, data.user];
          });
        }

        if (data.status === "OFFLINE") {
          setOnlineUsers((prev) =>
            prev.filter((u) => normalize(u) !== normalize(data.user)),
          );
        }
      });
      client.subscribe(`/user/queue/room/${roomId}/status`, (msg) => {
        const data = JSON.parse(msg.body);
        console.log("📩 Personal queue:", data);
        setOnlineUsers((prev) => {
          const user = normalize(data.user);
          if (prev.map(normalize).includes(user)) return prev;
          return [...prev, data.user];
        });
      });
      //trạng thái onl.off
      client.send(`/app/join/${roomId}`, {}, JSON.stringify({}));
    });

    return () => {
      client.disconnect(() => {
        console.log("STOMP DISCONNECTED");
      });
    };
  }, [roomId]);

  const sendTyping = () => {
    if (!stompClient || !stompClient.connected) return;
    console.log("sendTyping:", currentUser); // ✅ check
    stompClient.send(
      `/app/typing/${roomId}`,
      {},
      JSON.stringify({ sender: currentUser }),
    );
  };

  let typingTimeout = useRef(null);

  const handleTyping = (value) => {
    setInput(value);

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // sendTyping();

    typingTimeout.current = setTimeout(() => {
      sendTyping();
    }, 500);
  };

  // 1. Thêm Ref cho file input ở đây

  const fileInputRef = useRef(null);

  // 2. Hàm kích hoạt chọn file (Arrow Function)

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  // 3. Hàm xử lý khi người dùng chọn file xong (Arrow Function)

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file); // Lưu file vào state để tí nữa gửi

      setPreviewUrl(URL.createObjectURL(file)); // Tạo link để hiện ảnh xem trước
    }
  };

  const sendMessage = async () => {
    if (!stompClient || !stompClient.connected) return;

    if (!input.trim() && !selectedFile) return;

    let content = input;

    let type = "TEXT";

    //  upload nếu có file

    if (selectedFile) {
      try {
        const data = await uploadFileApi(selectedFile, "chat");

        content = data.url;

        type = selectedFile.type.startsWith("image") ? "IMAGE" : "FILE";
      } catch (err) {
        console.log("Upload fail", err);

        return;
      }
    }

    const msg = {
      sender: currentUser,

      content,

      roomId,

      type,
    };

    stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(msg));

    setInput("");

    setSelectedFile(null);

    setPreviewUrl(null);
  };

  //scrool down

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const handleLogout = () => {
    stompClient?.disconnect(); // 🔥 FIX NULL ERROR

    setConnected(false);

    setRoomId("");

    setCurrentUser("");

    setStompClient(null);

    localStorage.removeItem("token"); // optional

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col">
      {/* HEADER */}

      <header className="fixed top-0 left-0 w-full h-20 bg-gradient-to-r from-gray-950 via-gray-900 to-black backdrop-blur-md border-b border-green-500/20 flex items-center justify-between px-6 z-50 shadow-lg">
        {/* LEFT - ROOM */}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">
            #{roomId?.[0]?.toUpperCase()}
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Room</span>

            <h1 className="text-lg font-semibold text-green-400 tracking-wide">
              {roomId}
            </h1>
          </div>
        </div>

        {/* CENTER - STATUS */}

        <div className="hidden md:flex flex-col items-center">
          <span className="text-xs text-gray-400">Status</span>

          <span className="text-green-400 text-sm font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Online
          </span>
        </div>

        {/* RIGHT - USER + ACTION */}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
              {currentUser?.[0]?.toUpperCase()}
            </div>

            <div className="hidden sm:flex flex-col">
              <span className="text-xs text-gray-400">User</span>

              <span className="text-sm font-semibold text-white">
                {currentUser}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500/90 hover:bg-red-600 transition px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:scale-105 active:scale-95"
          >
            Leave
          </button>
        </div>
      </header>

      {/* CHAT BODY */}

      <main
        ref={chatBoxRef}
        className="flex-1 min-h-0 pt-24 pb-28 px-4 md:px-10 overflow-y-scroll w-full md:w-2/3 mx-auto"

        // ref={chatBoxRef}

        // className="flex-1 min-h-0 pt-24 pb-28 px-4 md:px-10 overflow-y-auto custom-scroll w-full md:w-2/3 mx-auto"
      >
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === currentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md p-3 rounded-2xl shadow-md border backdrop-blur-md

              ${
                message.sender === currentUser
                  ? "bg-green-500/20 border-green-500/30 text-right"
                  : "bg-gray-800/60 border-gray-700 text-left"
              }`}
              >
                <div
                  className={`flex gap-3 items-start min-w-0 ${
                    message.sender === currentUser
                      ? "flex-row-reverse text-right"
                      : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      className="h-9 w-9 rounded-full border border-gray-600"
                      src={ndt}
                      alt="avatar"
                    />

                    {onlineUsers
                      .map(normalize)
                      .includes(normalize(message.sender)) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full" />
                    )}
                  </div>

                  {/** */}

                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-xs text-gray-300 font-semibold">
                      {message.sender}
                    </p>
                    {/* 🟢 GREEN DOT ĐẶT Ở ĐÂY */}
                    {/* //onlineUsers.includes(message.sender)*/}

                    {message.content?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img
                        src={message.content}
                        className="w-40 rounded cursor-pointer hover:scale-105 transition"
                        onClick={() => setZoomImage(message.content)}
                      />
                    ) : message.content?.includes("/storage/") ? (
                      <a
                        href={message.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        Download the file to view more.
                      </a>
                    ) : (
                      <p className="break-all whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400">
                      {formatTime(message.timeStamp)}
                    </p>
                  </div>

                  {/** */}
                </div>
              </div>
            </div>
          ))}

          {zoomImage && (
            <div
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
              onClick={() => setZoomImage(null)}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <TransformWrapper>
                  <TransformComponent>
                    <img
                      src={zoomImage}
                      className="max-w-[90vw] max-h-[90vh] rounded-lg"
                    />
                  </TransformComponent>
                </TransformWrapper>
              </div>
            </div>
          )}
          {typingUser && (
            <div className="flex justify-start">
              <div className="bg-gray-800/60 border border-gray-700 px-4 py-3 rounded-2xl">
                <p className="text-sm text-gray-400 italic">
                  {typingUser} is typing
                  <span className="animate-pulse">...</span>
                </p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-gray-950/90 backdrop-blur-md border-t border-green-500/20 py-4">
        <div className="flex flex-col w-full md:w-2/3 mx-auto px-4 gap-2">
          {/* PHẦN THÊM VÀO: Hiển thị tên file hoặc ảnh sau khi chọn */}

          {selectedFile && (
            <div className="flex items-center gap-2 bg-gray-800 w-fit p-2 rounded-lg border border-purple-500 animate-pulse">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  className="w-10 h-10 object-cover rounded"
                  alt="preview"
                />
              ) : (
                <span className="text-xs text-gray-300 px-2">
                  {selectedFile.name}
                </span>
              )}

              <button
                onClick={() => {
                  setSelectedFile(null);

                  setPreviewUrl(null);
                }}
                className="text-red-500 font-bold ml-2 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          )}

          {/* GIỮ NGUYÊN PHẦN DƯỚI CỦA BẠN */}

          <div className="relative w-full">
            {/* 👉 EMOJI PICKER */}

            {showEmoji && (
              <div ref={emojiRef} className="absolute bottom-16 left-0 z-50">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}

            <div className="flex items-center gap-3 w-full">
              <input
                value={input}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800/70 text-white px-5 py-3 rounded-full outline-none focus:ring-2 focus:ring-green-500 border border-gray-700"
              />

              {/**Button icon */}

              <button
                type="button"
                onClick={() => setShowEmoji(!showEmoji)}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600 transition"
              >
                <MdEmojiEmotions size={20} />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 transition"
              >
                <MdAttachFile size={20} />
              </button>

              <button
                onClick={sendMessage}
                className="w-11 h-11 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 transition shadow-lg shadow-green-500/20"
              >
                <MdSend size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
