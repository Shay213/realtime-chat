"use client";

import React, { useCallback, useRef, useState } from "react";
import TextAreaAutosize from "react-textarea-autosize";
import Button from "./ui/Button";
import axios from "axios";

interface ChatInput {
  chatPartner: User;
  chatId: string;
}

const ChatInput = ({ chatPartner, chatId }: ChatInput) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async () => {
    setIsLoading(true);

    try {
      await axios.post("/api/message/send", { text: input, chatId });
    } catch (error) {}
  }, [chatId, input]);

  return (
    <div className="border-t border-gray-200 p-4 mb-2 sm:mb-0">
      <div
        className="
        relative flex-1 overflow-hidden rounded-lg shadow-sm 
        ring-1 ring-inset ring-gray-300 focus-within:ring-2 
        focus-within:ring-indigo-600
      "
      >
        <TextAreaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
        />
        <div
          onClick={() => textareaRef.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div>

        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <Button onClick={sendMessage} type="submit" isLoading={isLoading}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
