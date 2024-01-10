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
} from '@/utils/app/conversation';
import { throttle } from '@/utils/data/throttle';

import { ChatBody, Conversation, Message } from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';

import { ChatInput } from './ChatInput';
import { ChatLoader } from './ChatLoader';
import { MemoizedChatMessage } from './MemoizedChatMessage';
import { Logo } from './Logo';

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

export const Chat = memo(({ stopConversationRef }: Props) => {
  const { t } = useTranslation('chat');

  const {
    state: {
      selectedConversation,
      conversations,
      loading,
    },
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
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
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
        const endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
        const bearerToken = process.env.NEXT_PUBLIC_BEARER_TOKEN;

        if (typeof endpoint === 'undefined' || typeof bearerToken === 'undefined') {
          throw new Error('REACT_APP_API_ENDPOINT or REACT_APP_BEARER_TOKEN is not defined');
        }

        let body;
        const jsonRequest = { "source": null, "prompt": message["content"] };
        const controller = new AbortController();
        console.log("jsonContent", jsonRequest);
        body = JSON.stringify(jsonRequest);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${bearerToken}`
          },
          signal: controller.signal,
          body,
        });
        if (!response.ok) {
          console.log("nonono !response.ok");
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
          console.log("jsonResponse", jsonResponse);

          let answer: string = jsonResponse[0].choices[0].content as string;
          console.log("LLM snap answer: ", answer);

          // **************Redline*****************
          // render answer with Red Line use case
          if (answer !== null && answer.includes("[Red Line]")) {
            // Disable potential HTML tags from original answer to avoid XSS Attack
            answer.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            // Split the answer into sentences
            const sentences = answer.split(/(?<!\s\.)([.!?])/);
            // Identify sentences after [Red Line] and wrap them in a span with a red underline
            answer = sentences
              .map((sentence) => {
                console.log("sentence: ", sentence);
                if (sentence.includes('[Red Line]')) {
                  const [, restOfSentence] = sentence.split('[Red Line]');
                  return ` <span style="border-bottom: 2px solid red;">${restOfSentence.trim()}</span>`;
                } else {
                  return sentence;
                }
              })
              .join('');
            console.log("Rendered HTML result with red line: ", answer);
          }
          // **************Redline*****************
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
    [
      conversations,
      selectedConversation,
      stopConversationRef,
    ],
  );

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

  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);

  useEffect(() => {
    throttledScrollDown();
    selectedConversation && selectedConversation.messages &&
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
            />);
        })}

        {loading && <ChatLoader />}

        <div
          className="h-[162px] bg-white dark:bg-[#343d62]"
          ref={messagesEndRef}
        />
      </div>

      <ChatInput
        stopConversationRef={stopConversationRef}
        textareaRef={textareaRef}
        onSend={(message, plugin) => {
          setCurrentMessage(message);
          handleSend(message, 0, plugin);
        }}
        onScrollDownClick={handleScrollDown}
        onRegenerate={() => {
          if (currentMessage) {
            handleSend(currentMessage, 2, null);
          }
        }}
        showScrollDownButton={showScrollDownButton}
      />
    </div>
  );
});
Chat.displayName = 'Chat';
