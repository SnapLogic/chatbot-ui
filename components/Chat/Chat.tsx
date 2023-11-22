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

import { getEndpoint } from '@/utils/app/api';
import {
  saveConversation,
  saveConversations,
  updateConversation,
} from '@/utils/app/conversation';
import { throttle } from '@/utils/data/throttle';

import { ChatBody, Conversation, Message } from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';

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
    state: { selectedConversation, conversations, loading },
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

        console.log(endpoint);
        console.log(bearerToken);

        // const endpoint = "http://localhost:8888/api/1/rest/slsched/feed/snaplogic/projects/shared/RAG%20Task"

        if (
          typeof endpoint === 'undefined' ||
          typeof bearerToken === 'undefined'
        ) {
          throw new Error(
            'REACT_APP_API_ENDPOINT or REACT_APP_BEARER_TOKEN is not defined',
          );
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
          console.log('nonono !response.ok');
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
          const answer: string = jsonResponse[0].choices[0].content as string;
          // const answer = "<div> <p className=\"underline text-red-500\">Your string with red underline</p> </div>";
          // const updatedMessages: Message[] = [
          //   ...updatedConversation.messages,
          //   { role: 'assistant', content: ${answer} },
          // ];
          // const answer = "Your string with red underline";
          // const answer = `Swimming Spectacle
          // In this document, we will explore various highlights from the world of swimming, covering exhilarating competitions, exceptional athletes, and record-breaking feats in the pool.
          // [Red Line] Before we dive into the world of swimming, let's discuss some delectable options at the poolside cafe. Swimmers and spectators alike can enjoy a range of snacks, from refreshing fruit platters to energy-boosting smoothies.
          // The first highlight of the day was a riveting freestyle relay. The relay teams showcased incredible speed and teamwork, with each swimmer pushing their limits to secure victory. Cheers echoed through the aquatic arena as the winning team touched the wall.
          // In the individual events, a world-class swimmer shattered records in the butterfly stroke, leaving spectators in awe of the athlete's skill and precision.
          // [Red Line] By the pool, there's a grill serving delicious barbecue dishes. Many gather there to enjoy grilled treats and the vibrant atmosphere.
          // The last highlight of the day was a closely contested backstroke final. Swimmers raced with determination, and the finish was so close that a photo finish was needed to determine the winner.
          // After the swimming events, you can visit the nearby ice cream parlor for a cool treat, adding a sweet conclusion to a day filled with thrilling swims and delightful refreshments.`;

          // Create a div element to hold the HTML content
          // const answerContainer = document.createElement("div");
          // answerContainer.innerHTML = `<span style="text-decoration: underline; color: red;">${answer}</span>`;

          console.log('LLM snap answer: ', answer);
          // Split the answer into sentences
          const sentences = answer.split(/(?<!\s\.)([.!?])/);
          // Identify sentences after [Red Line] and wrap them in a span with a red underline
          const renderdAnswer = sentences
            .map((sentence) => {
              console.log('sentence: ', sentence);
              if (sentence.includes('[Red Line]')) {
                const [, restOfSentence] = sentence.split('[Red Line]');
                return `<span style="border-bottom: 2px solid red;">${restOfSentence.trim()}</span>`;
              } else {
                return sentence;
              }
            })
            .join('');

          console.log('Rendered HTML result with red line: ', renderdAnswer);

          const updatedMessages: Message[] = [
            ...updatedConversation.messages,
            { role: 'assistant', content: renderdAnswer },
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
    [conversations, selectedConversation, stopConversationRef],
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
