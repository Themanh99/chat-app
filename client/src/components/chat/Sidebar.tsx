
import { Settings, Plus, Hash, LogOut, User } from "lucide-react";
import { Avatar, Button, Tooltip, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { MOCK_CHANNELS, MOCK_DMS } from "../../lib/mock-data";
import { useAuth } from "../../hooks/useAuth";
import { useState } from "react";
import ProfileModal from "../profile/ProfileModal";
import SettingsModal from "../settings/SettingsModal";

interface SidebarProps {
    onChatSelect?: () => void;
}

const Sidebar = ({ onChatSelect }: SidebarProps) => {
    const { logout, userInfo } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

    return (
        <div className="w-full md:w-[280px] lg:w-[320px] h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                    ChatApp
                </h1>
                <Tooltip title="Create Channel">
                     <Button type="text" shape="circle" icon={<Plus size={20} className="text-gray-500" />} />
                </Tooltip>
            </div>

            {/* Channels List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                
                {/* Groups */}
                <div>
                    <div className="flex items-center justify-between px-2 mb-2">
                         <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Groups</span>
                         <Plus size={14} className="text-gray-400 cursor-pointer hover:text-violet-500" />
                    </div>
                    <div className="space-y-1">
                        {MOCK_CHANNELS.map(channel => (
                            <div 
                                key={channel.id} 
                                onClick={onChatSelect}
                                className="group flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            >
                                <Hash size={18} className="text-gray-400 mr-3 group-hover:text-violet-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{channel.name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Direct Messages */}
                <div>
                     <div className="flex items-center justify-between px-2 mb-2">
                         <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Direct Messages</span>
                         <Plus size={14} className="text-gray-400 cursor-pointer hover:text-violet-500" />
                    </div>
                     <div className="space-y-1">
                        {MOCK_DMS.map(dm => (
                            <div 
                                key={dm.id} 
                                onClick={onChatSelect}
                                className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="relative mr-3">
                                    <Avatar size="small" style={{ backgroundColor: '#fde3cf', color: '#f56a00' }}>{dm.name[0]}</Avatar>
                                     <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${dm.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                </div>
                                <div>
                                     <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{dm.name}</p>
                                     <p className="text-xs text-gray-400 truncate w-32">{dm.lastMessage}</p>
                                </div>
                             </div>
                        ))}
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
        </div>
    );
};

export default Sidebar;
