import { Id } from "../../convex/_generated/dataModel"
import { create } from "zustand";

export type Conversation = {
    _id: Id<"conversations">
    image?: string;
    participantes: Id<"users">[];
    isGroup: boolean;
    name?: string;
    groupImage?: string;
    groupName?: string;
    admin?: Id<"users">;
    isOnline?: boolean;
    lastMessage?: {
        _id: Id<"messages">;
        conversation: Id<"conversations">;
        content: string;
        sender: Id<"users">;
    };
};

type ConversationStore = {
    selectedConversation: Conversation | null;
    setSelectedConversation: (Conversation: Conversation |null) => void;
}

export const useConversationStore = create<ConversationStore>((set: any) => ({
    selectedConversation: null,
    setSelectedConversation: (Conversation: Conversation |null) => set({ selectedConversation: Conversation }),
}))