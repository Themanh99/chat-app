
import { useState, useEffect } from "react";
import { Button, Input, Form, Avatar, Upload, message, Tabs, Modal } from "antd";
import { UserOutlined, UploadOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import type { UploadProps } from "antd";

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
}

const ProfileModal = ({ open, onClose }: ProfileModalProps) => {
    const { userInfo, updateProfile, updatePassword } = useAuth();
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && userInfo) {
            form.setFieldsValue({
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
            });
        }
    }, [open, userInfo, form]);

    const handleUpdateProfile = async (values: any) => {
        setLoading(true);
        try {
            await updateProfile(values);
            // message.success handled in hook
        } catch (error) {
            // error handled in hook
        } finally {
            setLoading(false);
        }
    };
    
    const handleUpdatePassword = async (values: any) => {
        setLoading(true);
        try {
            await updatePassword(values);
            passwordForm.resetFields();
        } catch (error) {
            // error handled in hook
        } finally {
             setLoading(false);
        }
    };

    const uploadProps: UploadProps = {
        name: 'file',
        action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188', // Placeholder
        headers: {
            authorization: 'authorization-text',
        },
        onChange(info) {
             if (info.file.status === 'done') {
                message.success(`${info.file.name} file uploaded successfully`);
                // Ideally here we get the URL from response and call updateProfile
                // For now, just a mock message
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
    };

    const items = [
        {
            key: '1',
            label: 'Profile Info',
            children: (
                <div className="flex flex-col items-center gap-6 py-4">
                     <div className="relative group">
                        <Avatar 
                            size={100} 
                            src={userInfo?.image} 
                            icon={<UserOutlined />} 
                            className="bg-violet-200 text-violet-600"
                        >
                            {!userInfo?.image && userInfo?.email?.[0]?.toUpperCase()}
                        </Avatar>
                        <Upload {...uploadProps} showUploadList={false} className="absolute bottom-0 right-0">
                            <Button 
                                type="primary" 
                                shape="circle" 
                                icon={<UploadOutlined />} 
                                size="small" 
                                className="bg-violet-600 border-violet-600"
                            />
                        </Upload>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdateProfile}
                        className="w-full max-w-sm"
                        initialValues={{
                            firstName: userInfo?.firstName,
                            lastName: userInfo?.lastName
                        }}
                    >
                         <Form.Item label="Email">
                            <Input 
                                prefix={<MailOutlined className="text-gray-400" />} 
                                value={userInfo?.email} 
                                disabled 
                                className="bg-gray-50"
                            />
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="firstName" label="First Name">
                                 <Input placeholder="First Name" />
                            </Form.Item>
                            <Form.Item name="lastName" label="Last Name">
                                 <Input placeholder="Last Name" />
                            </Form.Item>
                        </div>
                        <Form.Item>
                             <Button type="primary" htmlType="submit" loading={loading} block className="bg-violet-600 hover:bg-violet-700">
                                Save Changes
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            ),
        },
        {
            key: '2',
            label: 'Security',
            children: (
                <div className="flex flex-col items-center gap-6 py-4">
                     <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleUpdatePassword}
                        className="w-full max-w-sm"
                    >
                        <Form.Item
                            name="currentPassword"
                            label="Current Password"
                            rules={[{ required: true, message: 'Please input your current password!' }]}
                        >
                            <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
                        </Form.Item>
                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Please input your new password!' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
                        </Form.Item>
                         <Form.Item
                            name="confirmPassword"
                            label="Confirm Password"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Please confirm your new password!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined className="text-gray-400" />} />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block className="bg-violet-600 hover:bg-violet-700">
                                Update Password
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            ),
        },
    ];

    return (
        <Modal
            title="My Profile"
            open={open}
            onCancel={onClose}
            footer={null}
            width={500}
            centered
            className="rounded-2xl overflow-hidden"
        >
             <Tabs defaultActiveKey="1" items={items} />
        </Modal>
    );
};

export default ProfileModal;
