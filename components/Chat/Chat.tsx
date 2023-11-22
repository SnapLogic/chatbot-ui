import {
  MutableRefObject,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import { useTranslation } from 'next-i18next';

import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { throttle } from '@/utils/data/throttle';

import { ChatBody, Conversation, Message } from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';

import pipelineConfig from '../../pipeline.config';
import Spinner from '../Spinner';
import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { Logo } from './Logo';
import { MemoizedChatMessage } from './MemoizedChatMessage';

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

export const Chat = memo(({ stopConversationRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: { selectedConversation, conversations, loading, pipelineId },
    handleUpdateConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);
  const [isTyping, setIsTyping] = useState(false);
  const [animatedMessage, setAnimatedMessage] = useState('');
  const [showLogo, setShowLogo] = useState(true);

  const lastScrollY = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0) => {
      const selectedPipeline = pipelineConfig.pipelines.find(
        (pipeline) => pipeline.id === pipelineId,
      );
      if (!selectedPipeline) {
        throw new Error('Pipeline not found');
      }

      const endpoint = selectedPipeline ? selectedPipeline.url : null;
      if (!endpoint) {
        throw new Error('Pipeline endpoint not found');
      }
      if (selectedConversation) {
        let updatedConversation: Conversation;
        if (deleteCount) {
          const updatedMessages = [...selectedConversation.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          updatedConversation = {
            ...selectedConversation,
            messages: [...updatedMessages, message],
          };
        } else {
          updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
          };
        }
        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
        homeDispatch({ field: 'loading', value: true });
        homeDispatch({ field: 'messageIsStreaming', value: true });
        const chatBody: ChatBody = {
          messages: updatedConversation.messages,
        };

        // const bearerTokenEnvName = `NEXT_PUBLIC_BEARER_TOKEN_${pipelineId}`;
        // const bearerToken = process.env[bearerTokenEnvName]

        // console.log(process.env);
        // console.log(process.env.NEXT_PUBLIC_BEARER_TOKEN_0);
        // console.log(process.env.NEXT_PUBLIC_BEARER_TOKEN_1);
        // console.log(process.env.NEXT_PUBLIC_BEARER_TOKEN_2);
        // console.log("endpoint", endpoint);
        // console.log("pipelineId", pipelineId);
        // console.log("bearerTokenName", selectedPipeline.envVar);
        // console.log("token", process.env[selectedPipeline.envVar]);

        const bearerToken = selectedPipeline.apiKey;

        if (!bearerToken) {
          throw new Error('NEXT_PUBLIC_BEARER_TOKEN is not defined');
        }

        let body;
        // if (!plugin) {
        //   body = JSON.stringify(chatBody);
        // } else {
        //   body = JSON.stringify({
        //     ...chatBody,
        //   });
        // }
        const jsonRequest = { source: null, prompt: message['content'] };
        const controller = new AbortController();
        console.log('jsonContent', jsonRequest);
        body = JSON.stringify(jsonRequest);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${bearerToken}`,
          },
          signal: controller.signal,
          body,
        });
        if (!response.ok) {
          console.log('no http response!');
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          toast.error(response.statusText);
          return;
        }
        const data = response.body;
        if (!data) {
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
          return;
        } else {
          const jsonResponse = await response.json();
          console.log('jsonResponse', jsonResponse);
          const answer = jsonResponse[0].choices[0].content;
          console.log('answer', answer);
          const updatedMessages: Message[] = [
            ...updatedConversation.messages,
            { role: 'assistant', content: answer },
          ];
          updatedConversation = {
            ...updatedConversation,
            messages: updatedMessages,
          };
          homeDispatch({
            field: 'selectedConversation',
            value: updatedConversation,
          });
          saveConversation(updatedConversation);
          const updatedConversations: Conversation[] = conversations.map(
            (conversation) => {
              if (conversation.id === selectedConversation.id) {
                return updatedConversation;
              }
              return conversation;
            },
          );
          if (updatedConversations.length === 0) {
            updatedConversations.push(updatedConversation);
          }
          homeDispatch({ field: 'conversations', value: updatedConversations });
          saveConversations(updatedConversations);
          homeDispatch({ field: 'loading', value: false });
          homeDispatch({ field: 'messageIsStreaming', value: false });
        }
      }
    },
    [conversations, selectedConversation, stopConversationRef, pipelineId],
  );

  const scrollToBottom = useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const onClearAll = () => {
    if (
      confirm(t<string>('Are you sure you want to clear all messages?')) &&
      selectedConversation
    ) {
      handleUpdateConversation(selectedConversation, {
        key: 'messages',
        value: [],
      });
    }
  };

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  useEffect(() => {
    throttledScrollDown();
    selectedConversation &&
      selectedConversation.messages &&
      setCurrentMessage(
        selectedConversation.messages[selectedConversation.messages.length - 2],
      );
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  return (
    <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343d62]">
      <div
        className="max-h-full overflow-x-hidden"
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        <Logo />
        {selectedConversation?.messages?.map((message, index) => {
          return (
            <MemoizedChatMessage
              key={index}
              message={message}
              messageIndex={index}
            />
          );
        })}

        {loading && <ChatLoader />}

        <div className="h-[162px]" ref={messagesEndRef} />
      </div>

      <ChatInput
        stopConversationRef={stopConversationRef}
        textareaRef={textareaRef}
        onSend={(message) => {
          setCurrentMessage(message);
          handleSend(message, 0);
        }}
        onScrollDownClick={handleScrollDown}
        onRegenerate={() => {
          if (currentMessage) {
            handleSend(currentMessage, 2);
          }
        }}
        showScrollDownButton={showScrollDownButton}
      />
    </div>
  );
});
Chat.displayName = 'Chat';
