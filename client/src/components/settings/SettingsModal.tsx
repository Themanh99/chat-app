
import { Switch, Modal, List } from "antd";
import { Moon, Sun, Monitor, Bell } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
}

const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
    const { userInfo, updateSettings } = useAuth();

    const handleThemeChange = (checked: boolean) => {
        const newTheme = checked ? "dark" : "light";
        updateSettings({ theme: newTheme });
        
        // Apply theme immediately
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleStatusChange = (checked: boolean) => {
         updateSettings({ activeStatus: checked });
    };

    const handleNotificationsChange = (checked: boolean) => {
         updateSettings({ notifications: checked });
    };

    const data = [
        {
            title: "Appearance",
            description: "Customize the look and feel",
            icon: <Moon size={20} className="text-violet-500" />,
            actions: [
                <div key="theme" className="flex items-center gap-2">
                    <Sun size={16} className="text-gray-400" />
                    <Switch 
                        checked={userInfo?.theme === 'dark'} 
                        onChange={handleThemeChange} 
                    />
                    <Moon size={16} className="text-gray-400" />
                </div>
            ]
        },
        {
            title: "Active Status",
            description: "Show when you're active",
            icon: <Monitor size={20} className="text-green-500" />,
            actions: [
                <Switch 
                    key="status" 
                    checked={userInfo?.activeStatus ?? true} 
                    onChange={handleStatusChange} 
                />
            ]
        },
        {
            title: "Notifications",
            description: "Manage your notification preferences",
            icon: <Bell size={20} className="text-blue-500" />,
            actions: [
                <Switch 
                    key="notifications" 
                    checked={userInfo?.notifications ?? true} 
                    onChange={handleNotificationsChange} 
                />
            ]
        }
    ];

    return (
        <Modal
            title="Settings"
            open={open}
            onCancel={onClose}
            footer={null}
            width={500}
            centered
        >
             <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={(item) => (
                    <List.Item actions={item.actions}>
                        <List.Item.Meta
                            avatar={
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    {item.icon}
                                </div>
                            }
                            title={<span className="text-lg font-medium dark:text-gray-200">{item.title}</span>}
                            description={<span className="text-gray-500 dark:text-gray-400">{item.description}</span>}
                        />
                    </List.Item>
                )}
            />
        </Modal>
    );
};

export default SettingsModal;
