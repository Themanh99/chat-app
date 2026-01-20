
import { Search, Phone, Video, MoreVertical, Send, ArrowLeft } from "lucide-react";
import { Button, Input, Avatar } from "antd";
import { useChatStore } from "../../store/chat-store";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../context/SocketContext";
import { useEffect, useState, useRef } from "react";
import { apiClient } from "../../lib/api-client";
import moment from "moment";

interface ChatContainerProps {
    onOpenSidebar?: () => void;
}

const ChatContainer = ({ onOpenSidebar }: ChatContainerProps) => {
    const { selectedChatData, selectedChatType, selectedChatMessages, setSelectedChatMessages, addMessage } = useChatStore();
    const { userInfo } = useAuth();
    const { socket } = useSocket();
    const [messageContent, setMessageContent] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState<{ userId: string; userName: string } | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const getMessages = async () => {
             try {
                if (!selectedChatData?._id) return;
                const response = await apiClient.get(`/api/messages/${selectedChatData._id}`);
                setSelectedChatMessages(response.data.messages);
             } catch (error) {
                 console.error("Error fetching messages:", error);
             }
        };

        if (selectedChatData?._id) {
            getMessages();
            if (socket) {
                socket.emit("join-channel", selectedChatData._id);
            }
        }
    }, [selectedChatData, setSelectedChatMessages, socket]);

    useEffect(() => {
        if (socket) {
            const handleReceiveMessage = (message: any) => {
                // Add message regardless of current selected chat (for notification purposes later)
                // But only show in UI if it's the current chat
                if (selectedChatData && selectedChatData._id === message.channelId) {
                     addMessage(message);
                }
            };

            const handleTyping = ({ userId, userName, channelId }: { userId: string; userName: string; channelId: string }) => {
                if (selectedChatData?._id === channelId && userId !== userInfo?.id) {
                    setIsTyping({ userId, userName });
                }
            };

            const handleStopTyping = ({ channelId }: { userId: string; channelId: string }) => {
                if (selectedChatData?._id === channelId) {
                    setIsTyping(null);
                }
            };

            socket.on("receive-message", handleReceiveMessage);
            socket.on("typing", handleTyping);
            socket.on("stop-typing", handleStopTyping);

            return () => {
                socket.off("receive-message", handleReceiveMessage);
                socket.off("typing", handleTyping);
                socket.off("stop-typing", handleStopTyping);
            };
        }
    }, [socket, selectedChatData, addMessage, userInfo?.id]);
    
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChatMessages]);

    const handleTypingStart = () => {
        if (!socket || !selectedChatData?._id || !userInfo) return;
        
        socket.emit("typing", { 
            channelId: selectedChatData._id, 
            userId: userInfo.id,
            userName: userInfo.firstName || userInfo.email
        });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stop-typing", { channelId: selectedChatData._id, userId: userInfo.id });
        }, 2000);
    };

    const handleSendMessage = async () => {
        if (!messageContent.trim() || !selectedChatData?._id) return;

        // Stop typing indicator when sending
        if (socket && userInfo) {
            socket.emit("stop-typing", { channelId: selectedChatData._id, userId: userInfo.id });
        }

        try {
            await apiClient.post("/api/messages", {
                channelId: selectedChatData._id,
                content: messageContent,
                messageType: "text"
            });
            setMessageContent("");
        } catch (error) {
             console.error("Error sending message:", error);
        }
    };

    const getChatHeaderInfo = () => {
        if (!selectedChatData) return { title: "", sub: "" };
        if (selectedChatType === "dm") {
             const partner = selectedChatData.members.find((m: any) => m._id !== userInfo?.id) || selectedChatData.members[0];
             return {
                 title: partner.firstName ? `${partner.firstName} ${partner.lastName}` : partner.email,
                 sub: partner.activeStatus ? "Online" : "Offline" // Or Last Seen
             };
        } else {
             return {
                 title: selectedChatData.name,
                 sub: `${selectedChatData.members.length} members`
             };
        }
    };

    const { title, sub } = getChatHeaderInfo();

    if (!selectedChatData) {
        return (
             <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-950 h-full">
                 <p className="text-gray-500">Select a chat to start messaging</p>
             </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950 relative">
            {/* Chat Header */}
            <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm z-10 sticky top-0">
                 <div className="flex items-center">
                     {/* Mobile Back Button (Replaces Menu on mobile when chat is open) */}
                     {onOpenSidebar && (
                         <Button 
                            type="text" 
                            icon={<ArrowLeft size={20} />} 
                            className="md:hidden mr-2" 
                            onClick={onOpenSidebar}
                         />
                     )}
                     <div>
                         <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                         <p className="text-xs text-gray-500">{sub}</p>
                     </div>
                 </div>
                 <div className="flex items-center space-x-2 text-gray-500">
                     <Search size={20} className="cursor-pointer hover:text-violet-600" />
                     <Phone size={20} className="hidden sm:block cursor-pointer hover:text-violet-600" />
                     <Video size={20} className="hidden sm:block cursor-pointer hover:text-violet-600" />
                     <MoreVertical size={20} className="cursor-pointer hover:text-violet-600" />
                 </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-black/5">
                 {selectedChatMessages.map((msg, index) => {
                     const isMe = msg.sender._id === userInfo?.id;
                     return (
                         <div key={msg._id} className={`flex items-start ${isMe ? 'flex-row-reverse' : ''}`}>
                             <Avatar 
                                src={msg.sender.image} 
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isMe ? 'ml-3' : 'mr-3'}`}
                                style={{ backgroundColor: msg.sender.color || '#fde3cf', color: '#f56a00' }}
                             >
                                 {msg.sender.firstName ? msg.sender.firstName[0] : msg.sender.email[0]}
                             </Avatar>
                             
                             <div className={`flex flex-col ${isMe ? 'items-end' : ''}`}>
                                 <div className="flex items-baseline space-x-2">
                                     {!isMe && <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{msg.sender.firstName}</span>}
                                     <span className="text-xs text-gray-400">{moment(msg.createdAt).format("LT")}</span>
                                 </div>
                                 <div className={`${isMe ? 'bg-violet-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-tl-none border border-gray-100 dark:border-gray-800'} p-3 rounded-2xl shadow-sm mt-1 max-w-md break-words`}>
                                     <p className="text-sm">{msg.content}</p>
                                 </div>
                             </div>
                         </div>
                     );
                 })}
                 <div ref={scrollRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                {/* Typing Indicator */}
                {isTyping && (
                    <div className="text-xs text-gray-500 mb-2 animate-pulse">
                        {isTyping.userName} is typing...
                    </div>
                )}
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-transparent focus-within:border-violet-500 transition-colors">
                     <Input 
                        placeholder="Type a message..." 
                        variant="borderless" 
                        className="bg-transparent"
                        value={messageContent}
                        onChange={(e) => {
                            setMessageContent(e.target.value);
                            handleTypingStart();
                        }}
                        onPressEnter={handleSendMessage}
                     />
                     <Button 
                        type="primary" 
                        shape="circle" 
                        icon={<Send size={16} />} 
                        className="bg-violet-600" 
                        onClick={handleSendMessage}
                    />
                </div>
            </div>
        </div>
    );
};

export default ChatContainer;
