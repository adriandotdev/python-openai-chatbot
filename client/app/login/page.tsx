"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import { loadSession, login, saveSession } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loadSession()) router.replace("/");
  }, [router]);

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      saveSession(await login(username.trim(), password));
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setIsLoading(false);
    }
  }

  return (
    <VStack
      align="center"
      justify="center"
      minHeight="100dvh"
      padding={4}
      style={{ background: "var(--color-background-body)" }}
    >
      <Card width="100%" maxWidth="420px" padding={8}>
        <form onSubmit={handleSubmit}>
          <VStack gap={4}>
            <VStack gap={3}>
              <Avatar name="Chatbot" size={40} shape="rounded" tooltip={false} />
              <VStack gap={1}>
                <Heading level={1} type="display-3">
                  Sign in to your chats
                </Heading>
                <Text color="secondary">
                  Pick up where you left off, with your history in the sidebar.
                </Text>
              </VStack>
            </VStack>
            {error && <Banner status="error" title={error} />}
            <TextInput
              label="Username"
              value={username}
              onChange={setUsername}
              isRequired
              isDisabled={isLoading}
            />
            <TextInput
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              isRequired
              isDisabled={isLoading}
            />
            <Button
              label="Sign in"
              type="submit"
              variant="primary"
              width="100%"
              isLoading={isLoading}
              isDisabled={!username.trim() || !password}
            />
          </VStack>
        </form>
      </Card>
    </VStack>
  );
}
