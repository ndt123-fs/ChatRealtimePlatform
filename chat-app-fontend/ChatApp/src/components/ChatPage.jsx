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
import ringtoneFile from "../assets/ringmess.mp3";

import {
  BsCameraVideo,
  BsCameraVideoOff,
  BsMicFill,
  BsMicMuteFill,
  BsTelephoneXFill,
} from "react-icons/bs";
import { BsCameraVideoFill } from "react-icons/bs";
const ChatPage = () => {
  const chatEndRef = useRef(null);

  const [typingUser, setTypingUser] = useState(null);
  const ringtoneRef = useRef(null);

  useEffect(() => {
    ringtoneRef.current = new Audio(ringtoneFile);
    ringtoneRef.current.loop = true;
  }, []);
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
  // call video
  const [showUserList, setShowUserList] = useState(false);
  const [callState, setCallState] = useState(null);
  // callState: null | "calling" | "receiving" | "in-call"
  const [callTarget, setCallTarget] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  //call video
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
  //call  func video :start , end,answer

  const ICE_SERVERS = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const startCall = async (targetUser) => {
    setCallTarget(targetUser);
    setCallState("calling"); // ✅ render video element trước
    setShowUserList(false);

    // ✅ chờ DOM render
    await new Promise((resolve) => setTimeout(resolve, 100));

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        stompClient.send(
          `/app/video/${roomId}`,
          {},
          JSON.stringify({
            type: "VIDEO_ICE",
            target: targetUser,
            candidate: e.candidate,
          }),
        );
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    stompClient.send(
      `/app/video/${roomId}`,
      {},
      JSON.stringify({
        type: "VIDEO_OFFER",
        target: targetUser,
        offer,
      }),
    );
  };

  const handleVideoSignal = async (data) => {
    if (data.type === "VIDEO_OFFER") {
      setIncomingCall(data);
      setCallState("receiving");
      ringtoneRef.current?.play();
    }

    if (data.type === "VIDEO_ANSWER") {
      await peerConnectionRef.current.setRemoteDescription(data.answer);
      setCallState("in-call");
    }

    if (data.type === "VIDEO_ICE") {
      await peerConnectionRef.current.addIceCandidate(data.candidate);
    }

    if (data.type === "VIDEO_REJECT") {
      endCall();
      alert(`${data.sender} đã từ chối cuộc gọi`);
    }

    if (data.type === "VIDEO_END") {
      endCall();
    }
  };

  const answerCall = async () => {
    ringtoneRef.current?.pause();
    setCallState("in-call"); // ✅ render video element trước
    setCallTarget(incomingCall.sender);

    // ✅ chờ DOM render
    await new Promise((resolve) => setTimeout(resolve, 100));

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = stream;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        stompClient.send(
          `/app/video/${roomId}`,
          {},
          JSON.stringify({
            type: "VIDEO_ICE",
            target: incomingCall.sender,
            candidate: e.candidate,
          }),
        );
      }
    };

    await pc.setRemoteDescription(incomingCall.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    stompClient.send(
      `/app/video/${roomId}`,
      {},
      JSON.stringify({
        type: "VIDEO_ANSWER",
        target: incomingCall.sender,
        answer,
      }),
    );
  };

  const rejectCall = () => {
    ringtoneRef.current?.pause();
    stompClient.send(
      `/app/video/${roomId}`,
      {},
      JSON.stringify({
        type: "VIDEO_REJECT",
        target: incomingCall.sender,
      }),
    );
    setCallState(null);
    setIncomingCall(null);
  };
  const endCall = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject = null;
    }

    if (callState === "in-call") {
      stompClient.send(
        `/app/video/${roomId}`,
        {},
        JSON.stringify({
          type: "VIDEO_END",
          target: callTarget,
        }),
      );
    }

    setCallState(null);
    setCallTarget(null);
    setIncomingCall(null);
  };

  // Thêm 2 hàm này
  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  const toggleCam = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsCamOff((prev) => !prev);
    }
  };
  //call video
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
      client.subscribe(`/user/queue/video/${roomId}`, (msg) => {
        const data = JSON.parse(msg.body);
        handleVideoSignal(data);
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
          <button
            onClick={() => setShowUserList(true)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-full text-xs font-semibold transition"
          >
            <BsCameraVideoFill size={14} color="white" />
            Gọi video
          </button>
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
      {/* DANH SÁCH USER ĐỂ GỌI */}
      {showUserList && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80">
            <h2 className="text-white font-semibold mb-4">Chọn người để gọi</h2>
            {onlineUsers
              .filter((u) => normalize(u) !== normalize(currentUser))
              .map((user) => (
                <button
                  key={user}
                  onClick={() => startCall(user)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-700 transition mb-2"
                >
                  <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center font-bold">
                    {user[0].toUpperCase()}
                  </div>
                  <span className="text-white">{user}</span>
                  <span className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
                </button>
              ))}
            <button
              onClick={() => setShowUserList(false)}
              className="w-full mt-2 py-2 text-gray-400 hover:text-white transition"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* INCOMING CALL */}
      {callState === "receiving" && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {incomingCall?.sender[0].toUpperCase()}
            </div>
            <p className="text-white font-semibold text-lg">
              {incomingCall?.sender}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Đang gọi video cho bạn...
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={rejectCall}
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg"
              >
                <BsTelephoneXFill size={22} color="white" />
              </button>

              <button
                onClick={answerCall}
                className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg"
              >
                <BsCameraVideoFill size={22} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO CALL */}
      {(callState === "calling" || callState === "in-call") && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            {/* Video người kia - full */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {/* <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            /> */}
            {/* Video mình - góc phải dưới, to hơn */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-20 right-4 w-48 h-36 rounded-2xl border-2 border-white object-cover shadow-2xl z-10"
            />

            {/* Tên người đang gọi */}
            <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full z-10">
              <p className="text-white text-sm font-semibold">{callTarget}</p>
            </div>

            {callState === "calling" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-4xl font-bold mx-auto mb-4">
                    {callTarget?.[0]?.toUpperCase()}
                  </div>
                  <p className="text-white text-xl animate-pulse">
                    Đang gọi {callTarget}...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Thanh nút bên dưới */}
          <div className="h-20 flex items-center justify-center gap-6 bg-black/80 shrink-0">
            {/* Tắt/bật camera */}
            <button
              onClick={toggleCam}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition ${
                isCamOff
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
            >
              {isCamOff ? (
                <BsCameraVideoOff size={22} color="white" />
              ) : (
                <BsCameraVideo size={22} color="white" />
              )}
            </button>

            {/* Kết thúc */}
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg"
            >
              <BsTelephoneXFill size={22} color="white" />
            </button>

            {/* Tắt/bật micro */}
            <button
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition ${
                isMuted
                  ? "bg-gray-600 hover:bg-gray-700"
                  : "bg-gray-500 hover:bg-gray-600"
              }`}
            >
              {isMuted ? (
                <BsMicMuteFill size={22} color="white" />
              ) : (
                <BsMicFill size={22} color="white" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
