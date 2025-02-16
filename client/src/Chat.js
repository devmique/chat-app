import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [userJoined, setUserJoined] = useState(false);
  const [joinMessages, setJoinMessages] = useState([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      console.log("Sending message:", currentMessage);
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    if (!userJoined) {
      setUserJoined(true);
      // Emit join message to server
      socket.emit("user_joined", { room, username });

      // Show join message for current user
      setJoinMessages((list) => [...list, `${username} has joined the room ${room}`]);
    }

    socket.on("receive_message", (data) => {
      console.log("Message received:", data);
      setMessageList((list) => [...list, data]);
    });

    socket.on("user_joined", (data) => {
      console.log("User joined:", data);
      setJoinMessages((list) => [...list, `${data.username} has joined the room`]);
    });
    
    // Clean up the event listeners when the component unmounts
    return () => {
      socket.off("receive_message");
      socket.off("user_joined");
    };
  }, [socket, userJoined, username, room]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="active"></div>
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        {joinMessages.map((msg, index) => (
          <div key={index} className="user-joined">{msg}</div>
        ))}
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => (
            <div
              key={index} // Unique key for each message
              className="message"
              id={username === messageContent.author ? "you" : "other"}
            >
              <div>
                <p id="author">{messageContent.author}</p>
                <div className="message-content">
                  <p>{messageContent.message}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Send a message..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}><i className="material-icons">send</i></button>
      </div>
    </div>
  );
}

export default Chat;
