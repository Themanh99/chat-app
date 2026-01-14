
import { Settings, Plus, Hash } from "lucide-react";
import { Avatar, Button, Tooltip } from "antd";
import { MOCK_CHANNELS, MOCK_DMS } from "../../lib/mock-data";

const Sidebar = () => {
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
                            <div key={channel.id} className="group flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
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
                             <div key={dm.id} className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
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
                 <div className="flex items-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                      <Avatar className="mr-3" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                      <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Me</p>
                          <p className="text-xs text-gray-500">My Status</p>
                      </div>
                      <Settings size={18} className="text-gray-400" />
                 </div>
             </div>
        </div>
    );
};

export default Sidebar;
