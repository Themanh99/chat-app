
import { Settings, Plus, Hash, LogOut, User } from "lucide-react";
import { Avatar, Button, Tooltip, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useAuth } from "../../hooks/useAuth";
import { useState, useEffect } from "react";
import ProfileModal from "../profile/ProfileModal";
import SettingsModal from "../settings/SettingsModal";
import NewChatModal from "./NewChatModal";
import { useChatStore } from "../../store/chat-store";
import { apiClient } from "../../lib/api-client";

interface SidebarProps {
    onChatSelect?: () => void;
}

const Sidebar = ({ onChatSelect }: SidebarProps) => {
    const { logout, userInfo } = useAuth();
    const { 
        channels, 
        setChannels, 
        setSelectedChatType, 
        setSelectedChatData, 
        selectedChatData
    } = useChatStore();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const response = await apiClient.get("/api/channels/get-user-channels");
                setChannels(response.data.channels);
            } catch (error) {
                console.error("Error fetching channels:", error);
                // message.error("Failed to load chats");
            }
        };
        
        if (userInfo) {
            fetchChannels();
        }
    }, [userInfo, setChannels]);

    const handleChatClick = (channel: any) => {
        setSelectedChatType(channel.type);
        setSelectedChatData(channel);
        // Clear previous messages to trigger fresh load
        setSelectedChatMessages([]);
        if (onChatSelect) onChatSelect();
    };
    
    const getDmPartner = (channel: any) => {
        if (!userInfo || !channel.members) return null;
        return channel.members.find((m: any) => m._id !== userInfo.id) || channel.members[0]; // Fallback to self (Saved messages?) or first
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'profile',
            label: 'Profile',
            icon: <User size={16} />,
            onClick: () => setIsProfileOpen(true),
        },
        {
            key: 'settings',
            label: 'Settings',
            icon: <Settings size={16} />,
            onClick: () => setIsSettingsOpen(true),
        },
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogOut size={16} />,
            danger: true,
            onClick: logout,
        },
    ];

    // Filter channels
    const groupChannels = channels.filter(c => c.type === 'group');
    const dmChannels = channels.filter(c => c.type === 'dm');

    return (
        <div className="w-full md:w-[280px] lg:w-[320px] h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    ChatApp
                </h1>
                <Tooltip title="New Chat">
                     <Button 
                        type="text" 
                        shape="circle" 
                        icon={<Plus size={20} className="text-gray-500" />} 
                        onClick={() => setIsNewChatOpen(true)}
                    />
                </Tooltip>
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                
                {/* Groups */}
                {groupChannels.length > 0 && (
                    <div>
                        <div className="flex items-center justify-between px-2 mb-2">
                             <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Groups</span>
                             <Plus size={14} className="text-gray-400 cursor-pointer hover:text-violet-500" />
                        </div>
                        <div className="space-y-1">
                            {groupChannels.map(channel => (
                                <div 
                                    key={channel._id} 
                                    onClick={() => handleChatClick(channel)}
                                    className={`group flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${selectedChatData?._id === channel._id ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
                                >
                                    <Hash size={18} className="text-gray-400 mr-3 group-hover:text-violet-500" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{channel.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Direct Messages */}
                <div>
                     <div className="flex items-center justify-between px-2 mb-2">
                         <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Direct Messages</span>
                         <Plus 
                            size={14} 
                            className="text-gray-400 cursor-pointer hover:text-violet-500" 
                            onClick={() => setIsNewChatOpen(true)}
                        />
                    </div>
                     <div className="space-y-1">
                        {dmChannels.map(channel => {
                            const partner = getDmPartner(channel);
                            if (!partner) return null;
                            return (
                                <div 
                                    key={channel._id} 
                                    onClick={() => handleChatClick(channel)}
                                    className={`flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors ${selectedChatData?._id === channel._id ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
                                >
                                    <div className="relative mr-3">
                                        <Avatar size="small" src={partner.image} style={{ backgroundColor: partner.color || '#fde3cf', color: '#f56a00' }}>
                                            {partner.firstName ? partner.firstName[0] : partner.email[0]}
                                        </Avatar>
                                         <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${partner.activeStatus ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    </div>
                                    <div>
                                         <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            {partner.firstName ? `${partner.firstName} ${partner.lastName}` : partner.email}
                                         </p>
                                         {/* <p className="text-xs text-gray-400 truncate w-32">{dm.lastMessage}</p> */}
                                    </div>
                                 </div>
                            );
                        })}
                     </div>
                </div>

            </div>

             {/* Footer (Profile) */}
             <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <Dropdown menu={{ items: menuItems }} placement="topLeft" trigger={['click']}>
                     <div className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                          <Avatar className="mr-3" src={userInfo?.image || undefined}>{!userInfo?.image && userInfo?.email?.[0]}</Avatar>
                          <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                                  {userInfo?.firstName ? `${userInfo.firstName} ${userInfo.lastName}` : userInfo?.email}
                              </p>
                              <p className="text-xs text-gray-500">Online</p>
                          </div>
                     </div>
                </Dropdown>
             </div>

             {/* Modals */}
             <ProfileModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
             <SettingsModal open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
             <NewChatModal open={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} />
        </div>
    );
};

export default Sidebar;
