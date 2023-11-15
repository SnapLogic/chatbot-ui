import { Conversation, Message } from '@/types/chat';
import { ErrorMessage } from '@/types/error';
import { FolderInterface } from '@/types/folder';

export interface HomeInitialState {
  apiKey: string;
  loading: boolean;
  lightMode: 'light' | 'dark';
  pipelineId: number;
  messageIsStreaming: boolean;
  modelError: ErrorMessage | null;
  folders: FolderInterface[];
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  temperature: number;
  showChatbar: boolean;
  showPromptbar: boolean;
  currentFolder: FolderInterface | undefined;
  messageError: boolean;
  searchTerm: string;
}

export const initialState: HomeInitialState = {
  apiKey: '',
  loading: false,
  lightMode: 'light',
  pipelineId: 0,
  messageIsStreaming: false,
  modelError: null,
  folders: [],
  conversations: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  temperature: 1,
  showPromptbar: true,
  showChatbar: true,
  currentFolder: undefined,
  messageError: false,
  searchTerm: '',
};
