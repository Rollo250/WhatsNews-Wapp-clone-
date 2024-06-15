import { IMessage, useConversationStore } from "@/store/chat-store";
import { useMutation } from "convex/react";
import { Ban, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../../convex/_generated/api";

type ChatAvatarActionsProps = {
  message: IMessage;
  me: any;
};

const ChatAvatarActions = ({ me, message }: ChatAvatarActionsProps) => {
  const { selectedConversation, setSelectedConversation } = useConversationStore();

  const isMember = selectedConversation?.participantes.includes(message.sender?._id);
  const quitarUser = useMutation(api.conversations.quitarUser);
  const createConversation = useMutation(api.conversations.createConversation);

  const handlequitarUser = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedConversation) return;
    const prevConversation = selectedConversation; // Guarda el valor actual de selectedConversation
    try {
      await quitarUser({
        conversationId: selectedConversation._id,
        userId: message.sender._id,
      });
  
      setSelectedConversation({
        ...prevConversation,
        participantes: prevConversation.participantes.filter((id: any) => id.toString() !== message.sender._id.toString()),
      });
    } catch (error) {
      toast.error("No se pudo quitar al usuario");
    }
  };

  const handleCreateConversation = async () => {
    try {
      const conversationId = await createConversation({
        isGroup: false,
        participantes: [message.sender._id, me._id],
      });

      setSelectedConversation({
        _id: conversationId,
        name: message.sender.name,
        participantes: [message.sender._id, me._id],
        isGroup: false,
        isOnline: message.sender.isOnline,
        image: message.sender.image,
      });
    } catch (error) {
      toast.error("No se pudo crear la conversación");
    }
  };

  return (
    <div className="text-[11px] flex gap-4 justify-between font-bold cursor-pointer group">
      <span onClick={handleCreateConversation}>{message.sender.name}</span>

      {!isMember && <Ban size={16} className="text-red-500" />}
      {isMember && selectedConversation?.admin === me._id && (
        <LogOut
          size={16}
          className="text-red-500 opacity-0 group-hover:opacity-100"
          onClick={handlequitarUser}
        />
      )}
    </div>
  );
};

export default ChatAvatarActions;