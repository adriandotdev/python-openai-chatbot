"use client";

import { useState } from "react";
import {
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
} from "@astryxdesign/core/Chat";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Text } from "@astryxdesign/core/Text";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(text: string) {
    const message = text.trim();
    if (!message || isLoading) return;

    const id = Date.now();
    setMessages((prev) => [...prev, { id, role: "user", content: message }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/messages/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json: { data: { role: string; content: string }[] } =
        await res.json();
      setMessages((prev) => [
        ...prev,
        { id: id + 1, role: "assistant", content: json.data[0].content },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: id + 1,
          role: "assistant",
          isError: true,
          content:
            err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <ChatLayout
        composer={
          <ChatComposer
            onSubmit={handleSubmit}
            isDisabled={isLoading}
            placeholder="Ask anything..."
          />
        }
        emptyState={<Text>Start a conversation by sending a message.</Text>}
      >
        {messages.length > 0 && (
          <ChatMessageList isStreaming={isLoading}>
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                sender={m.role}
              >
                <ChatMessageBubble>
                  {m.role === "assistant" && !m.isError ? (
                    <Markdown>{m.content}</Markdown>
                  ) : (
                    <Text>{m.isError ? `Error: ${m.content}` : m.content}</Text>
                  )}
                </ChatMessageBubble>
              </ChatMessage>
            ))}
            {isLoading && (
              <ChatMessage sender="assistant">
                <ChatMessageBubble>
                  <Text>Thinking...</Text>
                </ChatMessageBubble>
              </ChatMessage>
            )}
          </ChatMessageList>
        )}
      </ChatLayout>
    </div>
  );
}
