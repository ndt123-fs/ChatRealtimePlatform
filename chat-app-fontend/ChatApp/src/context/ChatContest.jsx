import { createContext, useContext, useState } from "react";

const ChatContext = createContext();
//value={{}} : truyen obj
// {children} : hien thi component con
//createContext truyen data giua cac component khong can truyen props qua tung cap
export const ChatProvider = ({ children }) => {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [connected, setConnected] = useState(false);
  return (
    <ChatContext.Provider
      value={{
        roomId,
        currentUser,

        connected,
        setRoomId,
        setCurrentUser,

        setConnected,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
const UseChatContext = () => useContext(ChatContext);
export default UseChatContext;
