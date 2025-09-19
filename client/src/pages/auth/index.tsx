import VictoryImg from "@/assets/victory.svg";
import BackgroundImg from "@/assets/login2.png";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Auth = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleLogin = async (): Promise<void> => {};

  const handleSignup = async (): Promise<void> => {};

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-4">
      <div className="auth-card max-h-[90vh] h-[80vh] w-[80vw] bg-white border-white text-opacity-90 shadow-2xl md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2 overflow-hidden">
        <div className="flex flex-col gap-10 justify-center items-center overflow-auto p-6">
          {/* Left auth page */}
          <div className="flex items-center justify-center flex-col">
            <div className="flex justify-center items-center">
              <h1 className="text-5xl font-bold md:text-6xl">Xin chào</h1>
              <img src={VictoryImg} alt="Victory icon" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">
              Nơi kết nối và chia sẻ những cuộc vui bí mật!
            </p>
          </div>

          {/* Right auth page */}
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-full md:w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Đăng nhập
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Đăng ký
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="flex flex-col gap-5 mt-10">
                <Input
                  type="email"
                  placeholder="Email"
                  className="border border-gray-300 rounded-full p-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  className="border border-gray-300 rounded-full p-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button className="rounded-full p-6" onClick={handleLogin}>
                  Login
                </Button>
              </TabsContent>
              <TabsContent value="signup" className="flex flex-col gap-5 mt-10">
                <Input
                  type="email"
                  placeholder="Email"
                  className="border border-gray-300 rounded-full p-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  className="border border-gray-300 rounded-full p-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  className="border border-gray-300 rounded-full p-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button className="rounded-full p-6" onClick={handleSignup}>
                  Signup
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        {/* Background Login UI */}
        <div className="hidden xl:flex justify-center items-center hide-on-short-height">
          <img
            src={BackgroundImg}
            alt="Background"
            className="max-h-[80vh] h-auto w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
