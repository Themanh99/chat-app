
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const userInfo = useAuthStore((state) => state.userInfo);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!userInfo) {
       // Allow access to auth page, but redirect others
       navigate("/auth");
    } else {
        // If authenticated and on auth page, redirect to chat
        if (location.pathname === "/auth") {
             if (userInfo.profileSetup) {
                 navigate("/chat");
             } else {
                 navigate("/profile");
             }
        }
    }
  }, [userInfo, navigate, location]);

  // If we are unauthenticated and trying to view a protected route, don't render children
  if (!userInfo) {
      return null;
  }

  return <>{children}</>;
};

// Separate component for Public Routes (like Auth) to prevent authenticated users from seeing them
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const userInfo = useAuthStore((state) => state.userInfo);
    const navigate = useNavigate();

    useEffect(() => {
        if (userInfo) {
             if (userInfo.profileSetup) {
                 navigate("/chat");
             } else {
                 navigate("/profile");
             }
        }
    }, [userInfo, navigate]);

    if (userInfo) return null;
    return <>{children}</>;
}

export default AuthGuard;
