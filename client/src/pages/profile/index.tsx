
import { Button } from "antd";
import { useAuth } from "../../hooks/useAuth";

const Profile = () => {
    const { userInfo, logout } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
                 <h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Profile Setup</h1>
                 
                 <div className="mb-6">
                     <p className="text-gray-600 dark:text-gray-300">Welcome, <strong>{userInfo?.email}</strong>!</p>
                     <p className="text-sm text-gray-500 mt-2">Finish your profile setup here.</p>
                 </div>

                 <Button type="primary" danger onClick={logout}>
                     Logout
                 </Button>
             </div>
        </div>
    );
};

export default Profile;
