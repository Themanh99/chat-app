
import { Search, Phone, Video, MoreVertical, Send, ArrowLeft } from "lucide-react";
import { Button, Input } from "antd";

interface ChatContainerProps {
    onOpenSidebar?: () => void;
}

const ChatContainer = ({ onOpenSidebar }: ChatContainerProps) => {
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
                         <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100"># General</h3>
                         <p className="text-xs text-gray-500">32 members, 5 online</p>
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
                 {/* Placeholder Messages */}
                 <div className="flex justify-center my-4">
                     <span className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-500 px-3 py-1 rounded-full">Today</span>
                 </div>
                 
                 <div className="flex items-start">
                     <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 font-bold mr-3 text-xs">A</div>
                     <div>
                         <div className="flex items-baseline space-x-2">
                             <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Alice</span>
                             <span className="text-xs text-gray-400">10:30 AM</span>
                         </div>
                         <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-800 mt-1 max-w-md">
                             <p className="text-gray-700 dark:text-gray-300 text-sm">Hey guys! Welcome to the new chat app.</p>
                         </div>
                     </div>
                 </div>

                 <div className="flex items-start flex-row-reverse">
                     <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold ml-3 text-xs">Me</div>
                     <div className="flex flex-col items-end">
                         <div className="flex items-baseline space-x-2">
                             <span className="text-xs text-gray-400">10:32 AM</span>
                             <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">You</span>
                         </div>
                         <div className="bg-violet-600 p-3 rounded-2xl rounded-tr-none shadow-md mt-1 max-w-md">
                             <p className="text-white text-sm">Looks amazing! Love the new design.</p>
                         </div>
                     </div>
                 </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-transparent focus-within:border-violet-500 transition-colors">
                     <Input 
                        placeholder="Type a message..." 
                        variant="borderless" 
                        className="bg-transparent"
                     />
                     <Button type="primary" shape="circle" icon={<Send size={16} />} className="bg-violet-600" />
                </div>
            </div>
        </div>
    );
};

export default ChatContainer;
