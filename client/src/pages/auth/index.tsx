
import { useState } from "react";
import { Tabs, Button, Input, Form} from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import BackgroundImage from "../../assets/login_background_pattern.png"; // Generated image path



// --- Schemas ---
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  pass: z.string().min(1, "Password is required"),
});

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    pass: z.string().min(6, "Password must be at least 6 characters"),
    confirmRender: z.string().min(1, "Confirm Password is required"),
  })
  .refine((data) => data.pass === data.confirmRender, {
    message: "Passwords don't match",
    path: ["confirmRender"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

// --- Components ---

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const user = await login(data);
      if (user) {
         if (user.profileSetup) navigate("/chat");
         else navigate("/profile");
      }
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="mt-4">
      <Form.Item
        label={<span className="font-medium text-gray-700 dark:text-gray-300">Email</span>}
        validateStatus={errors.email ? "error" : ""}
        help={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input {...field} size="large" className="rounded-xl" placeholder="Enter your email" />
          )}
        />
      </Form.Item>

      <Form.Item
        label={<span className="font-medium text-gray-700 dark:text-gray-300">Password</span>}
        validateStatus={errors.pass ? "error" : ""}
        help={errors.pass?.message}
      >
        <Controller
          name="pass"
          control={control}
          render={({ field }) => (
            <Input.Password {...field} size="large" className="rounded-xl" placeholder="Enter your password" />
          )}
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        loading={loading}
        className="mt-2 rounded-xl bg-violet-600 hover:bg-violet-700 border-none font-semibold h-12"
      >
        Login
      </Button>
    </Form>
  );
};

const SignupForm = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const user = await signup({ email: data.email, pass: data.pass });
       if (user) {
           navigate("/profile");
       }
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="mt-4">
      <Form.Item
        label={<span className="font-medium text-gray-700 dark:text-gray-300">Email</span>}
        validateStatus={errors.email ? "error" : ""}
        help={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input {...field} size="large" className="rounded-xl" placeholder="Enter your email" />
          )}
        />
      </Form.Item>

      <Form.Item
        label={<span className="font-medium text-gray-700 dark:text-gray-300">Password</span>}
        validateStatus={errors.pass ? "error" : ""}
        help={errors.pass?.message}
      >
        <Controller
          name="pass"
          control={control}
          render={({ field }) => (
            <Input.Password {...field} size="large" className="rounded-xl" placeholder="Create a password" />
          )}
        />
      </Form.Item>

      <Form.Item
        label={<span className="font-medium text-gray-700 dark:text-gray-300">Confirm Password</span>}
        validateStatus={errors.confirmRender ? "error" : ""}
        help={errors.confirmRender?.message}
      >
        <Controller
          name="confirmRender"
          control={control}
          render={({ field }) => (
            <Input.Password {...field} size="large" className="rounded-xl" placeholder="Confirm your password" />
          )}
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        block
        size="large"
        loading={loading}
        className="mt-2 rounded-xl bg-violet-600 hover:bg-violet-700 border-none font-semibold h-12"
      >
        Sign Up
      </Button>
    </Form>
  );
};

// --- Main Page ---

const Auth = () => {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Background Decorative Elements */}
        
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/20 blur-[120px] rounded-full animate-blob"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full animate-blob animation-delay-2000"></div>
        </div>

      <div className="w-full max-w-[1100px] h-[85vh] grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden z-10 border border-white/20 backdrop-blur-sm">
        
        {/* Left Side: Welcome / Image (Hidden on Mobile) */}
        <div className="hidden md:flex flex-col justify-center items-center bg-violet-50 dark:bg-gray-900/50 p-10 relative">
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${BackgroundImage})`, backgroundSize: 'cover' }}></div>
            <div className="relative z-10 text-center">
                 <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-4">
                    Welcome
                 </h1>
                 <p className="text-lg text-gray-500 dark:text-gray-400 max-w-sm">
                    Connect with friends, colleagues, and family in a secure and modern environment.
                 </p>
                 <img src="https://cdni.iconscout.com/illustration/premium/thumb/chat-app-illustration-download-in-svg-png-gif-file-formats--messaging-social-media-conversation-bubbles-mobile-development-pack-business-illustrations-4546467.png" alt="Chat Illustration" className="mt-10 w-[80%] drop-shadow-2xl" />
            </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="flex flex-col justify-center p-8 md:p-14 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
             <div className="md:hidden text-center mb-8">
                 <h1 className="text-4xl font-bold text-violet-600">Chat App</h1>
                 <p className="text-gray-500">Sign in to continue</p>
             </div>

          <Tabs
            defaultActiveKey="login"
            centered
            className="custom-tabs"
            items={[
              {
                key: "login",
                label: <span className="text-base font-medium">Login</span>,
                children: (
                    <div className="animate-fade-in">
                         <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome Back</h2>
                            <p className="text-gray-500 text-sm">Please enter your details to sign in.</p>
                         </div>
                        <LoginForm />
                    </div>
                ),
              },
              {
                key: "signup",
                label: <span className="text-base font-medium">Signup</span>,
                children: (
                    <div className="animate-fade-in">
                         <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create Account</h2>
                            <p className="text-gray-500 text-sm">Join us and start chatting today.</p>
                         </div>
                        <SignupForm />
                    </div>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
