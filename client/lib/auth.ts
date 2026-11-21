export type ChatMessageData = { role: "user" | "assistant"; content: string };

export type Conversation = { id: string; messages: ChatMessageData[] };

export type Session = {
  username: string;
  accessToken: string;
  conversations: Conversation[];
};

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const KEY = "chatbot.session";

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {}
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export async function fetchConversations(
  accessToken: string,
): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/api/v1/messages`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`Could not load conversations (${res.status})`);
  const json: {
    messages?: { id: string; conversation: ChatMessageData[] }[];
  } | null = await res.json();
  return (json?.messages ?? []).map((c) => ({
    id: c.id,
    messages: c.conversation ?? [],
  }));
}

export async function deleteConversation(
  accessToken: string,
  id: string,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/v1/messages/chat/${encodeURIComponent(id)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(`Delete failed (${res.status})`);
}

export async function login(
  username: string,
  password: string,
): Promise<Session> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    throw new Error(
      res.status === 401 ? "Invalid username or password." : `Login failed (${res.status})`,
    );
  }
  const json: {
    data: {
      access_token: string;
      chat: {
        username: string;
        messages: { id: string; conversation: ChatMessageData[] }[];
      } | null;
    };
  } = await res.json();
  return {
    username,
    accessToken: json.data.access_token,
    conversations: (json.data.chat?.messages ?? []).map((c) => ({
      id: c.id,
      messages: c.conversation,
    })),
  };
}
