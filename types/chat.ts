export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  messages: Message[];
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  folderId: string | null;
}
