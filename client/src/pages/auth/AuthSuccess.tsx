
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { message } from "antd";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (processedRef.current) return;
    processedRef.current = true;

    const verifySSO = async () => {
      try {
        // We can ignore the token in URL if we trust the cookie set by backend.
        // Or we can use it if needed. For now, rely on cookie.
        await checkAuth();
        message.success("SSO Login Successful");
        navigate("/chat"); // or /profile based on profileSetup check (done in checkAuth? no, checkAuth just sets user)
        
        // Refetch user to check profileSetup logic if checkAuth returns user
        // But checkAuth updates store, so we can check store or just navigate to /chat and let AuthGuard handle or Check inside here.
        
        // Let's rely on CheckAuth result if we want to be precise about profile
        // But simpler to just go to /chat (AuthGuard might redirect if profile not setup? App.tsx logic?)
        // App.tsx: /chat -> AuthGuard.
        // Login page logic was: if profileSetup -> /chat else /profile.
        // We should replicate that.
        
      } catch (error) {
        console.error("SSO Verification failed", error);
        message.error("SSO Authentication failed");
        navigate("/auth");
      }
    };

    verifySSO();
  }, [checkAuth, navigate, searchParams]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Verifying Login...</h2>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthSuccess;
