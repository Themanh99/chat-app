
import { useState } from "react";
import Sidebar from "./Sidebar";
import ChatContainer from "./ChatContainer";
import MobileNav from "./MobileNav";

const ChatLayout = () => {
    // For mobile mobile switching
    const [activeMobileTab, setActiveMobileTab] = useState<'chats' | 'groups' | 'profile'>('chats');
    const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
    
    return (
        <div className="flex h-screen w-full bg-white dark:bg-black overflow-hidden relative">
            
            {/* Desktop Sidebar (Always visible on md+, hidden on small) */}
            <div className="hidden md:block h-full transition-all duration-300 w-[var(--sidebar-width)]">
                <Sidebar onChatSelect={() => {}} />
            </div>

            {/* Mobile View Logic */}
            <div className="md:hidden flex flex-col w-full h-full pb-16">
                 {/* 
                     If Chat is open, show ChatContainer (full screen on mobile).
                     Else show the active tab content.
                 */}
                 
                 {isMobileChatOpen ? (
                     <ChatContainer onOpenSidebar={() => setIsMobileChatOpen(false)} /> 
                     /* Reusing onOpenSidebar as "Back to List" for mobile for now, will rename prop for clarity later/modify ChatContainer */
                 ) : (
                     <div className="h-full w-full overflow-hidden">
                        {activeMobileTab === 'chats' && (
                             <Sidebar onChatSelect={() => setIsMobileChatOpen(true)} />
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
                     </div>
                 )}

                 {/* Bottom Nav - Hide when in chat on mobile? Usually yes. */}
                 {!isMobileChatOpen && (
                    <MobileNav activeTab={activeMobileTab} setActiveTab={setActiveMobileTab} />
                 )}
            </div>

            {/* Desktop Chat Area (Always visible on md+) */}
            <div className="hidden md:flex flex-1 h-full">
                 <ChatContainer />
            </div>

        </div>
    );
};

export default ChatLayout;
