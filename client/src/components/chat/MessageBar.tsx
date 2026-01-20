
import { useState, useRef, useEffect } from "react";
import { Send, Smile, Paperclip } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../hooks/useAuth";
import { useChatStore } from "../../store/chat-store";
import { apiClient } from "../../lib/api-client";

const MessageBar = () => {
    const { socket } = useSocket();
    const { userInfo } = useAuth();
    const { selectedChatType, selectedChatData, addMessage } = useChatStore();
    const [message, setMessage] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSendMessage = async () => {
        if (!message.trim()) return;

        if (socket && selectedChatData) {
            try {
                const response = await apiClient.post("/api/messages", {
                    channelId: selectedChatData._id,
                    content: message,
                    messageType: "text",
                });
                
                if (response.status === 201) {
                    setMessage("");
                    // Socket emission is handled by backend or we can emit here optimistically
                    // Backend already emits "receive-message" to the channel room.
                    // We just need to make sure we are listening to it in MessageContainer or similar.
                }
            } catch (error) {
                console.error("Error sending message:", error);
            }
        }
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prev) => prev + emojiData.emoji);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && socket && selectedChatData) {
            const formData = new FormData();
            formData.append("file", file);
            
            try {
                const response = await apiClient.post("/api/messages/upload-file", formData, {
                   headers: {
                       "Content-Type": "multipart/form-data",
                   }
                });

                if (response.status === 200) {
                     const { fileUrl } = response.data;
                     // Send message with file
                     await apiClient.post("/api/messages", {
                        channelId: selectedChatData._id,
                        messageType: "file", // Or specific type based on file.type
                        fileUrl: fileUrl,
                    });
                }
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
    };

    return (
        <div className="h-[10vh] bg-white dark:bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
            <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
                <input 
                    type="text" 
                    className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none text-white"
                    placeholder="Enter Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSendMessage();
                        }
                    }}
                />
                <button 
                    className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip className="text-2xl" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                
                <div className="relative">
                    <button 
                        className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
                        onClick={() => setShowEmojiPicker(true)}
                    >
                        <Smile className="text-2xl" />
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute bottom-16 right-0" ref={emojiRef}>
                            <EmojiPicker theme={"dark" as any} onEmojiClick={handleEmojiClick} />
                        </div>
                    )}
                </div>
            </div>
            <button 
                className="bg-[#8b5cf6] rounded-md flex items-center justify-center p-5 focus:border-none hover:bg-[#7c4eef] focus:outline-none focus:text-white duration-300 transition-all"
                onClick={handleSendMessage}
            >
                <Send className="text-2xl text-white" />
            </button>
        </div>
    );
};

export default MessageBar;
