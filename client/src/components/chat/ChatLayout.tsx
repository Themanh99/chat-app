
import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatContainer from "./ChatContainer";
import MobileNav from "./MobileNav";

const ChatLayout = () => {
    // For mobile mobile switching
    const [activeMobileTab, setActiveMobileTab] = useState<'chats' | 'groups' | 'profile'>('chats');
    
    return (
        <div className="flex h-screen w-full bg-white dark:bg-black overflow-hidden relative">
            
            {/* Desktop Sidebar (Always visible on md+, hidden on small) */}
            <div className="hidden md:block h-full">
                <Sidebar />
            </div>

            {/* Mobile View Logic */}
            <div className="md:hidden flex flex-col w-full h-full pb-16">
                 {/* We show Sidebar content or Chat content based on tab? 
                     Actually, a common pattern is: List View -> Tap -> Chat View.
                     For now, let's strictly follow the user request: 
                     "when on mobile, sidebar hidden and shown by icons below" 
                 */}
                 
                 {activeMobileTab === 'chats' && (
                     <div className="h-full w-full">
                         <Sidebar />
                     </div>
                 )}
                 {activeMobileTab === 'groups' && (
                      <div className="w-full h-full flex items-center justify-center">
                          <p>Groups mock view</p>
                      </div>
                 )}
                 {activeMobileTab === 'profile' && (
                     <div className="w-full h-full flex items-center justify-center">
                          <p>Profile mock view</p> 
                     </div>
                 )}

                 {/* Bottom Nav */}
                 <MobileNav activeTab={activeMobileTab} setActiveTab={setActiveMobileTab} />
            </div>

            {/* Desktop Chat Area (Always visible on md+) */}
            <div className="hidden md:flex flex-1 h-full">
                 <ChatContainer />
            </div>

        </div>
    );
};

export default ChatLayout;
