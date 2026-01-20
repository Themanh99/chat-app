
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/auth";
import AuthSuccess from "./pages/auth/AuthSuccess";
import Chat from "./pages/chat";
import AuthGuard, { PublicRoute } from "./components/layout/AuthGuard";
import { SocketProvider } from "./context/SocketContext";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Accessible only if NOT logged in) */}
        <Route
          path="/auth"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/success"
          element={<AuthSuccess />}
        />

        {/* Private Routes (Protected) */}
        {/* Private Routes (Protected) */}
        <Route
          path="/chat"
          element={
            <AuthGuard>
              <SocketProvider>
                <Chat />
              </SocketProvider>
            </AuthGuard>
          }
        />
        
        {/* Redirects */}
        <Route path="/" element={<Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
