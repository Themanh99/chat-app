
import { Modal, Input, List, Avatar, Button, message } from "antd";
import { Search, MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import { apiClient } from "../../lib/api-client";
import { useChatStore } from "../../store/chat-store";

interface NewChatModalProps {
    open: boolean;
    onClose: () => void;
}

const NewChatModal = ({ open, onClose }: NewChatModalProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { setSelectedChatType, setSelectedChatData, addChannel } = useChatStore();

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            const response = await apiClient.post("/api/auth/search-users", { searchTerm });
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error searching users:", error);
            message.error("Failed to search users");
        } finally {
            setLoading(false);
        }
    };

    const handleStartChat = async (userId: string) => {
        try {
            const response = await apiClient.post("/api/channels/create-channel", {
                members: [userId] // Backend adds current user
            });
            
            const channel = response.data.channel;
            
            // Check if channel already exists in store if you want to avoid duplicates visually, 
            // but for now we just ensure it's selected.
            // Ideally we should check if it exists in the list, if not add it.
            
            // For now, let's just add it (the store logic or component should handle dedup if needed, or we just rely on the list update)
            // But since 'addChannel' pushes to top, let's do that.
            // Better: update the whole list or check.
            // Simpler: Just add. The backend returns the existing one if it exists.
            
            // If the channel is already in the list (by ID), we might duplicate it in the UI if we just append.
            // But we don't have a 'checkIfChannelExists' helper easily here without helper.
            // Let's assume onSidebar we fetch fresh list, or we just append and rely on React key to maybe warn but work, 
            // or we add a check in the store `addChannel`? Store `addChannel` implementation was simple append.
            
            // Let's trust the user flow: Create -> Open.
            // We should probably check if it's already there?
            // Let's just set it as active. The Sidebar list should ideally reflect it.
            
            addChannel(channel); 
            setSelectedChatType(channel.type);
            setSelectedChatData(channel);
            onClose();
            setSearchTerm("");
            setUsers([]);
        } catch (error) {
            console.error("Error creating channel:", error);
             message.error("Failed to start chat");
        }
    };

    return (
        <Modal
            title="New Chat"
            open={open}
            onCancel={onClose}
            footer={null}
            width={500}
        >
            <div className="flex gap-2 mb-4">
                <Input 
                    placeholder="Search users by name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onPressEnter={handleSearch}
                    prefix={<Search size={16} className="text-gray-400" />}
                />
                <Button type="primary" onClick={handleSearch} loading={loading}>
                    Search
                </Button>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                {users.length > 0 ? (
                    <List
                        itemLayout="horizontal"
                        dataSource={users}
                        renderItem={(user) => (
                            <List.Item
                                actions={[
                                    <Button 
                                        type="text" 
                                        icon={<MessageSquarePlus size={18} />} 
                                        onClick={() => handleStartChat(user._id)}
                                    >
                                        Chat
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar src={user.image} style={{ backgroundColor: user.color || '#fde3cf' }}>
                                            {user.firstName ? user.firstName[0] : user.email[0]}
                                        </Avatar>
                                    }
                                    title={`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email}
                                    description={user.email}
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    searchTerm && !loading && (
                         <div className="text-center text-gray-400 py-8">
                            No users found.
                         </div>
                    )
                )}
            </div>
        </Modal>
    );
};

export default NewChatModal;
