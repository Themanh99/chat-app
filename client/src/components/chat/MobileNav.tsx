
import { MessageSquare, Users, UserCircle } from "lucide-react";

interface MobileNavProps {
    activeTab: 'chats' | 'groups' | 'profile';
    setActiveTab: (tab: 'chats' | 'groups' | 'profile') => void;
}

const MobileNav = ({ activeTab, setActiveTab }: MobileNavProps) => {
    return (
        <div className="md:hidden h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex justify-around items-center px-4 fixed bottom-0 w-full z-50">
            <button 
                onClick={() => setActiveTab('chats')}
                className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'chats' ? 'text-violet-600' : 'text-gray-400'}`}
            >
                <MessageSquare size={24} />
                <span className="text-[10px] font-medium">Chats</span>
            </button>
            <button 
                onClick={() => setActiveTab('groups')}
                 className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'groups' ? 'text-violet-600' : 'text-gray-400'}`}
            >
                <Users size={24} />
                 <span className="text-[10px] font-medium">Groups</span>
            </button>
            <button 
                onClick={() => setActiveTab('profile')}
                 className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'profile' ? 'text-violet-600' : 'text-gray-400'}`}
            >
                <UserCircle size={24} />
                 <span className="text-[10px] font-medium">Profile</span>
            </button>
        </div>
    );
};

export default MobileNav;
