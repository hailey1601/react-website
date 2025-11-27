import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState, useEffect } from "react";

const ChatBot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const API_KEY = "AIzaSyD4LdSOcK--ZpvR-QpKiRmp6ACu-7X6Eak";
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  useEffect(() => {
    const chatBody = document.getElementById("chatbot-body");
    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, [messages]);

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender, id: Date.now() }]);
  };

  const getBotResponse = async (userMessage) => {
    try {
      let prompt = "";

      if (user.role === "admin") {
        prompt = `Bạn là một trợ lý chuyên hỗ trợ quản lý bài tập. Hãy trả lời câu hỏi về quản lý bài tập: "${userMessage}"`;
      } else {
        prompt = `Bạn là một trợ lý học tập. Hãy giúp người dùng hoàn thành bài tập và trả lời câu hỏi: "${userMessage}"`;
      }

      const result = await model.generateContent(prompt);
      let text = result.response.text();
      console.log("Original text: ", text);

      text = text.replace(/\*\*(.*?)\*\*/gs, "<strong>$1</strong>");
      text = text.replace(/(\d+)\.\s/g, "<strong>$1.</strong> ");
      text = text.replace(/\n/g, "<br />");

      return text || "Xin lỗi, mình không thể trả lời câu hỏi này lúc này.";
    } catch (error) {
      console.error("Lỗi khi gọi API Gemini:", error);
      return "Xin lỗi, mình không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.";
    }
  };

  const handleSend = async () => {
    if (inputMessage.trim() === "") return;

    const userMessage = inputMessage.trim();
    addMessage(userMessage, "user");
    setInputMessage("");
    setIsLoading(true);

    try {
      const botResponse = await getBotResponse(userMessage);
      addMessage(botResponse, "bot");
    } catch (error) {
      addMessage("Đã xảy ra lỗi, vui lòng thử lại.", "bot");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <>
      {/* Nút chatbox */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "#E28413",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          💬
        </button>
      )}

      {/* Chatbox Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "350px",
            height: "500px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1001,
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#E28413",
              color: "white",
              padding: "16px",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
              {user.role === "admin"
                ? "Trợ lý quản lý bài tập"
                : "Trợ lý học tập"}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              x
            </button>
          </div>

          {/* Chat body */}
          <div
            id="chatbot-body"
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              background: "#f8fafc",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "14px",
                  marginTop: "20px",
                }}
              >
                {user.role === "admin"
                  ? "Chào admin! Tôi có thể hỗ trợ bạn quản lý bài tập."
                  : "Hãy cùng nhau hoàn thành bài nào! Tôi sẽ hỗ trợ bạn học tập hiệu quả."}
              </div>
            )}
            {messages.map((messages) => (
              <div
                key={messages.id}
                style={{
                  marginBottom: "12px",
                  display: "flex",
                  justifyContent:
                    messages.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    background:
                      messages.sender === "user" ? "#E28413" : "#e2e8f0",
                    color: messages.sender === "user" ? "white" : "#1e293b",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    maxWidth: "80%",
                    fontSize: "14px",
                    lineHeight: "1.4",
                  }}
                  // dangerouslySetInnerHTML là cách của React để nói với trình duyệt: "Nội dung của biến này là HTML, hãy render nó ra thay vì hiển thị nó dưới dạng văn bản."
                  dangerouslySetInnerHTML={{ __html: messages.text }}
                ></div>
              </div>
            ))}
            {isLoading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    background: "#e2e8f0",
                    color: "#1e293b",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    fontSize: "14px",
                  }}
                >
                  Đang trả lời...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: "16px",
              borderTop: "1px solid #e2e8f0",
              background: "white",
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  user.role === "admin"
                    ? "Nhập câu hỏi về quản lý bài tập..."
                    : "Nhập câu hỏi về bài học..."
                }
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "20px",
                  fontSize: "14px",
                  outline: "none",
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || inputMessage.trim() === ""}
                style={{
                  background: "#E28413",
                  border: "none",
                  borderRadius: "20px",
                  padding: "8px 16px",
                  color: "white",
                  cursor:
                    inputMessage.trim() === "" || isLoading
                      ? "not-allowed"
                      : "pointer",
                  opacity: inputMessage.trim() === "" || isLoading ? 0.6 : 1,
                }}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
