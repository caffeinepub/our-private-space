import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface MediaReference {
    blob: ExternalBlob;
    name: string;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export type Time = bigint;
export type MessageId = string;
export interface ChatMessage {
    id: MessageId;
    media?: MediaReference;
    content: string;
    sender: Principal;
    timestamp: Time;
}
export interface MessageInput {
    media?: MediaReference;
    content: string;
}
export interface UserProfile {
    name: string;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMessage(messageId: MessageId): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAllMessages(): Promise<Array<ChatMessage>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDeletedMessageIds(): Promise<Array<string>>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(input: MessageInput): Promise<MessageId>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
}
