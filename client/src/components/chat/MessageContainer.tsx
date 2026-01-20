
import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/chat-store";
import { useAuth } from "../../hooks/useAuth";
import moment from "moment";
import { HOST } from "../../lib/constants";
import { File } from "lucide-react";

const MessageContainer = () => {
    const { selectedChatMessages } = useChatStore();
    const { userInfo } = useAuth();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedChatMessages]);

    const renderMessageContent = (message: any) => {
        if (message.messageType === "text") {
            return <div className="text-white">{message.content}</div>;
        } else if (message.messageType === "image" || (message.messageType === "file" && message.fileUrl?.match(/\.(jpeg|jpg|gif|png)$/))) {
             return (
                 <div className="cursor-pointer">
                     <img 
                        src={`${HOST}/${message.fileUrl}`} 
                        alt="attachment" 
                        height={150} 
                        width={150} 
                        className="rounded-md object-cover"
                    />
                 </div>
             );
        } else {
             return (
                 <div className="flex items-center gap-2 text-white">
                     <div className="text-3xl text-white/50 bg-black/20 rounded-full p-2">
                         <File size={20} />
                     </div>
                     <span>{message.fileUrl?.split('/').pop()}</span>
                     <span className="text-xs text-blue-300 ml-2 cursor-pointer hover:underline" onClick={() => window.open(`${HOST}/${message.fileUrl}`, '_blank')}>Download</span>
                 </div>
             );
        }
    };

    return (
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 md:w-[65vw] lg:w-[70vw] xl:w-[80vw] w-full">
            <div className="flex flex-col gap-5">
                {selectedChatMessages.map((message) => (
                     <div key={message._id} className={`flex ${message.sender?._id === userInfo?.id ? "justify-end" : "justify-start"}`}>
                         <div className={`flex flex-col gap-1 max-w-[70%] ${message.sender?._id === userInfo?.id ? "items-end" : "items-start"}`}>
                             <div className={`p-4 rounded-xl ${message.sender?._id === userInfo?.id ? "bg-[#8b5cf6]" : "bg-[#2a2b33]"}`}>
                                {renderMessageContent(message)}
                             </div>
                             <span className="text-xs text-gray-500">
                                 {moment(message.createdAt).format("LT")}
                             </span>
                         </div>
                     </div>
                ))}
                <div ref={scrollRef} />
            </div>
        </div>
    );
};

export default MessageContainer;
