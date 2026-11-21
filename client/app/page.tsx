"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChatComposer,
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
} from "@astryxdesign/core/Chat";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Item } from "@astryxdesign/core/Item";
import { Markdown } from "@astryxdesign/core/Markdown";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import {
  API_URL,
  clearSession,
  loadSession,
  saveSession,
  type Conversation,
  type Session,
} from "../lib/auth";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

function toMessages(history: Conversation["messages"]): Message[] {
  return history.map((m, i) => ({ id: i, role: m.role, content: m.content }));
}

function useIsNarrow() {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

export default function Page() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Id of the conversation being continued; null means a new chat.
  const [activeId, setActiveId] = useState<string | null>(null);
  const isNarrow = useIsNarrow();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const stored = loadSession();
    if (!stored) {
      router.replace("/login");
      return;
    }
    setSession(stored);
  }, [router]);

  if (!session) return null;

  function handleLogout() {
    clearSession();
    setMessages([]);
    setActiveId(null);
    setSession(null);
    router.replace("/login");
  }

  function startNewChat() {
    if (isLoading) return;
    setActiveId(null);
    setMessages([]);
    setIsNavOpen(false);
  }

  function openConversation(c: Conversation) {
    if (isLoading) return;
    setActiveId(c.id);
    setMessages(toMessages(c.messages));
    setIsNavOpen(false);
  }

  async function handleSubmit(text: string) {
    const message = text.trim();
    if (!message || isLoading || !session) return;

    const id = Date.now();
    setMessages((prev) => [...prev, { id, role: "user", content: message }]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/v1/messages/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ message, id: activeId }),
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json: { data: { id: string; role: string; content: string } } =
        await res.json();
      const { id: conversationId, content: reply } = json.data;
      setMessages((prev) => [
        ...prev,
        { id: id + 1, role: "assistant", content: reply },
      ]);
      const added = [
        { role: "user" as const, content: message },
        { role: "assistant" as const, content: reply },
      ];
      const exists = session.conversations.some((c) => c.id === conversationId);
      const next: Session = {
        ...session,
        conversations: exists
          ? session.conversations.map((c) =>
              c.id === conversationId
                ? { ...c, messages: [...c.messages, ...added] }
                : c,
            )
          : [...session.conversations, { id: conversationId, messages: added }],
      };
      setActiveId(conversationId);
      setSession(next);
      saveSession(next);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: id + 1,
          role: "assistant",
          isError: true,
          content: err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  // History = one entry per conversation: first prompt as title, latest reply as preview.
  const history = [...session.conversations].reverse().map((c) => ({
    conversation: c,
    title: c.messages.find((m) => m.role === "user")?.content ?? "New chat",
    reply: c.messages[c.messages.length - 1]?.content,
  }));

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const starters = [
    "Explain a concept in simple terms",
    "Help me draft a short email",
    "Review a piece of code with me",
  ];

  return (
    <HStack
      height="100dvh"
      align="stretch"
      style={{ background: "var(--color-background-body)" }}
    >
      {(!isNarrow || isNavOpen) && (
        <VStack
          as="nav"
          aria-label="Chat history"
          width={isNarrow ? "100%" : "264px"}
          paddingInline={3}
          paddingBlock={4}
          gap={4}
        >
          <HStack gap={2} align="center" paddingInline={1}>
            <Avatar name="Chatbot" size={32} shape="rounded" tooltip={false} />
            <Heading level={2} weight="semibold">
              Chatbot
            </Heading>
          </HStack>
          <Button
            label="New chat"
            variant="secondary"
            onClick={startNewChat}
            isDisabled={
              isLoading || (activeId === null && messages.length === 0)
            }
            width="100%"
          />
          <VStack gap={1} isScrollable style={{ flex: 1, minHeight: 0 }}>
            {history.length === 0 ? (
              <Text color="secondary" size="sm">
                Your conversations will appear here.
              </Text>
            ) : (
              history.map((h) => (
                <Item
                  key={h.conversation.id}
                  label={h.title}
                  description={h.reply}
                  labelLines={1}
                  descriptionLines={1}
                  density="compact"
                  isSelected={activeId === h.conversation.id}
                  onClick={() => openConversation(h.conversation)}
                />
              ))
            )}
          </VStack>
          <HStack gap={2} align="center" justify="between">
            <HStack gap={2} align="center" style={{ minWidth: 0 }}>
              <Avatar name={session.username} size={32} />
              <Text maxLines={1}>{session.username}</Text>
            </HStack>
            <Button label="Sign out" variant="ghost" onClick={handleLogout} />
          </HStack>
        </VStack>
      )}
      {(!isNarrow || !isNavOpen) && (
        <VStack
          height="100%"
          paddingBlock={1}
          paddingInlineEnd={1}
          style={{ flex: 1, minWidth: 0 }}
        >
          <VStack
            height="100%"
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              background: "var(--color-background-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-container)",
            }}
          >
            {isNarrow && (
              <HStack gap={2} align="center" padding={2}>
                <Button
                  label="Chats"
                  variant="ghost"
                  onClick={() => setIsNavOpen(true)}
                />
              </HStack>
            )}
            <ChatLayout
              composer={
                <ChatComposer
                  onSubmit={handleSubmit}
                  isDisabled={isLoading}
                  placeholder="Ask anything..."
                  elevation="none"
                />
              }
              emptyState={
                <VStack gap={5} align="center" maxWidth="560px" padding={4}>
                  <VStack gap={2} align="center">
                    <Heading level={1} type="display-3">
                      {greeting}, {session.username}.
                    </Heading>
                    <Text color="secondary">
                      Ask a question, or pick up one of your past chats from the
                      sidebar.
                    </Text>
                  </VStack>
                  <HStack gap={2} wrap="wrap" justify="center">
                    {starters.map((q) => (
                      <Button
                        key={q}
                        label={q}
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSubmit(q)}
                      />
                    ))}
                  </HStack>
                </VStack>
              }
            >
              {messages.length > 0 && (
                <ChatMessageList isStreaming={isLoading}>
                  {messages.map((m) => (
                    <ChatMessage key={m.id} sender={m.role}>
                      <ChatMessageBubble>
                        {m.role === "assistant" && !m.isError ? (
                          <Markdown>{m.content}</Markdown>
                        ) : (
                          <Text>
                            {m.isError ? `Error: ${m.content}` : m.content}
                          </Text>
                        )}
                      </ChatMessageBubble>
                    </ChatMessage>
                  ))}
                  {isLoading && (
                    <ChatMessage sender="assistant">
                      <ChatMessageBubble>
                        <Text color="secondary">Thinking...</Text>
                      </ChatMessageBubble>
                    </ChatMessage>
                  )}
                </ChatMessageList>
              )}
            </ChatLayout>
          </VStack>
        </VStack>
      )}
    </HStack>
  );
}
