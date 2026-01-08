import { Result } from "../../../shared/types/result";
import { IUser } from "../../auth/types";

export type Chat = {
    id: number;
    name: string;
    is_personal_chat: boolean;
    admin_id: number;
    avatar: string;
    members: ChatGroupMembers[];
    chat_messages: MessagePayload[];
};

export interface ChatGroupMembers {
    chat_groupId: number;
    profile_id: number;
    profile: IUser;
}

export type ChatWithMessagesAndParticipants = {
    chat_messages: MessagePayload[];
    members: ChatGroupMembers[];
} & {
    id: number;
};

export type MessagePayload = {
    content: string;
    sent_at: Date;
    author_id: number;
    chat_groupId: number;
    attached_image: string;
};

export type CreateMessage = {
    content?: string;
    attached_image?: string;
    author_id: number;
    chat_groupId: number;
    sent_at?: Date;
};

type IChatUpdatePayload = Chat;
type NewMessagePayload = CreateMessage;
type SendMessagePayload = MessagePayload;

export interface IJoinChatPayload {
    chatId: number;
}

export interface ILeaveChatPayload {
    chatId: number;
}
export type IJoinChatCallback = (response: Result<ChatWithMessagesAndParticipants>) => void;

export interface IServerEvents {
    newMessage: (data: NewMessagePayload) => void;
    chatUpdate: (data: IChatUpdatePayload) => void;
}

export interface IClientEvents {
    joinChat: (data: IJoinChatPayload, callback: IJoinChatCallback) => void;
    leaveChat: (data: ILeaveChatPayload) => void;
    sendMessage: (data: SendMessagePayload) => void;
}
