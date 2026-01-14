
import { useState } from "react";
import { Tabs, Card, Button, Input, Form, Typography, message } from "antd";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import { apiClient } from "../../lib/api-client";
import { AUTH_ROUTES } from "../../lib/constants";
import "../../App.css"; // Ensure Tailwind is available if needed, though we use AntD here

const { Title, Text } = Typography;

// --- Schemas ---

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  pass: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  pass: z.string().min(6, "Password must be at least 6 characters"),
  confirmRender: z.string().min(1, "Confirm Password is required"),
}).refine((data) => data.pass === data.confirmRender, {
  message: "Passwords don't match",
  path: ["confirmRender"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

// --- Components ---

const LoginForm = () => {
  const navigate = useNavigate();
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
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
      const response = await apiClient.post(AUTH_ROUTES.LOGIN, data);
      if (response.data.user) {
        setUserInfo(response.data.user);
        message.success("Login successful!");
        if (response.data.user.profileSetup) {
           navigate("/chat");
        } else {
           navigate("/profile");
        }
      }
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label="Email"
        validateStatus={errors.email ? "error" : ""}
        help={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Email" />}
        />
      </Form.Item>

      <Form.Item
        label="Password"
        validateStatus={errors.pass ? "error" : ""}
        help={errors.pass?.message}
      >
        <Controller
          name="pass"
          control={control}
          render={({ field }) => (
            <Input.Password {...field} placeholder="Password" />
          )}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" block loading={loading}>
        Login
      </Button>
    </Form>
  );
};

const SignupForm = () => {
  const navigate = useNavigate();
  const setUserInfo = useAuthStore((state) => state.setUserInfo);
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
      const response = await apiClient.post(AUTH_ROUTES.SIGN_UP, {
        email: data.email,
        pass: data.pass,
      });
      if (response.data.user) {
        setUserInfo(response.data.user);
        message.success("Signup successful!");
        navigate("/profile");
      }
    } catch (error: any) {
       console.error(error);
      message.error(error.response?.data?.error?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label="Email"
        validateStatus={errors.email ? "error" : ""}
        help={errors.email?.message}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => <Input {...field} placeholder="Email" />}
        />
      </Form.Item>

      <Form.Item
        label="Password"
        validateStatus={errors.pass ? "error" : ""}
        help={errors.pass?.message}
      >
        <Controller
          name="pass"
          control={control}
          render={({ field }) => (
            <Input.Password {...field} placeholder="Password" />
          )}
        />
      </Form.Item>

      <Form.Item
        label="Confirm Password"
        validateStatus={errors.confirmRender ? "error" : ""}
        help={errors.confirmRender?.message}
      >
        <Controller
          name="confirmRender"
          control={control}
          render={({ field }) => (
            <Input.Password {...field} placeholder="Confirm Password" />
          )}
        />
      </Form.Item>

      <Button type="primary" htmlType="submit" block loading={loading}>
        Sign Up
      </Button>
    </Form>
  );
};

// --- Main Page ---

const Auth = () => {
  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center bg-gray-100">
      <Card className="w-[400px] shadow-lg">
        <div className="text-center mb-6">
          <Title level={2}>Welcome to Chat App</Title>
          <Text type="secondary">Please login or signup to continue</Text>
        </div>
        <Tabs
          defaultActiveKey="login"
          items={[
            {
              key: "login",
              label: "Login",
              children: <LoginForm />,
            },
            {
              key: "signup",
              label: "Signup",
              children: <SignupForm />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Auth;
