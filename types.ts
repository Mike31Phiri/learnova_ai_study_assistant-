export enum MessageRole {
  User = 'user',
  Model = 'model',
}

export enum AttachmentType {
  Image = 'image',
  Audio = 'audio',
  PDF = 'pdf',
}

export interface Attachment {
  id: string;
  type: AttachmentType;
  url: string; // Object URL for preview
  base64: string;
  mimeType: string;
  name?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  attachments?: Attachment[];
  timestamp: number;
  isError?: boolean;
  feedback?: 'positive' | 'negative';
}

export interface AppState {
  messages: Message[];
  isLoading: boolean;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  university?: string;
  program?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}