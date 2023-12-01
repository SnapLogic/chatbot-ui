import { FC, memo } from "react";
import { ChatMessage, Props } from "./ChatMessage";

// export const MemoizedChatMessage: FC<Props> = memo(
//     ChatMessage,
//     (prevProps, nextProps) => (
//         prevProps.message.content === nextProps.message.content
//     )
// );


export const MemoizedChatMessage: FC<Props> = memo(({ message, messageIndex }) => {
  // Check if the message content contains HTML tags
  const isHTMLContent = /<\/?[a-z][\s\S]*>/i.test(message.content);

  if (isHTMLContent) {
    // If it contains HTML tags, render using dangerouslySetInnerHTML
    return <div dangerouslySetInnerHTML={{ __html: message.content }} />;
  }

  // Otherwise, render the content as plain text
  return (
    <div>
      {/* ... (other JSX for rendering the message) */}
      {message.content}
    </div>
  );
}, (prevProps, nextProps) => (
  prevProps.message.content === nextProps.message.content
));