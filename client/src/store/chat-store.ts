
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    image?: string;
    color?: number;
  };
  content: string;
  messageType: "text" | "image" | "audio" | "video" | "file";
  fileUrl?: string;
  createdAt: string;
}

interface ChatState {
  selectedChatType: "dm" | "channel" | undefined;
  selectedChatData: any | undefined;
  selectedChatMessages: Message[];
  isUploading: boolean;
  uploadProgress: number;
  
  channels: any[];
  setChannels: (channels: any[]) => void;
  addChannel: (channel: any) => void;
  
  setSelectedChatType: (type: "dm" | "channel" | undefined) => void;
  setSelectedChatData: (data: any) => void;
  setSelectedChatMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsUploading: (status: boolean) => void;
  setUploadProgress: (progress: number) => void;
  closeChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  isUploading: false,
  uploadProgress: 0,

  channels: [],
  setChannels: (channels: any[]) => set({ channels }),
  addChannel: (channel: any) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  },
  setSelectedChatType: (type) => set({ selectedChatType: type }),
  setSelectedChatData: (data) => set({ selectedChatData: data }),
  setSelectedChatMessages: (messages) => set({ selectedChatMessages: messages }),
  addMessage: (message) => {
      const messages = get().selectedChatMessages;
      set({ selectedChatMessages: [...messages, message] });
  },
  setIsUploading: (status) => set({ isUploading: status }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  closeChat: () => set({ 
      selectedChatType: undefined, 
      selectedChatData: undefined, 
      selectedChatMessages: [] 
  }),
}));
