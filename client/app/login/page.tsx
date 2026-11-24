"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Banner } from "@astryxdesign/core/Banner";
import { Button } from "@astryxdesign/core/Button";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { VStack } from "@astryxdesign/core/VStack";
import "./login.css";
import { ColorModeToggle } from "../color-mode";
import { loadSession, login, saveSession } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loadSession()) {
      router.replace("/");
      return;
    }
    // The router can keep this page's state alive after a successful sign-in,
    // so reset the spinner when we land here again (e.g. after logout).
    setIsLoading(false);
    setPassword("");
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
    <main className="login">
      <section className="login-scene">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="login-photo"
          src="/paris-blue-hour.jpg"
          alt="The Eiffel Tower lit gold against a deep blue evening sky, with a full moon beside it"
          width={1920}
          height={1280}
          decoding="async"
        />
        <span className="login-scrim" aria-hidden="true" />

        <p className="login-brand">Flâneur</p>

        <ul className="login-thread" aria-label="Example conversation">
          <li className="login-bubble login-bubble--user">
            Where should we eat in Montmartre tonight?
          </li>
          <li className="login-bubble login-bubble--guide">
            Dinner on rue des Abbesses at 8:30, then up to Sacré-Cœur before the
            lights come on.
          </li>
        </ul>

        <header className="login-copy">
          <h1 className="login-title">Paris, one message away.</h1>
          <p className="login-lede">
            Ask for a table in the Marais, a quiet hour at the Orsay, the last
            Métro home. Your whole trip, in one conversation.
          </p>
          <p className="login-credit">
            Photo: “Eiffel Tower – Blue hour – Paris” by alyssa BLACK.,{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/2.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC BY-SA 2.0
            </a>
            , via{" "}
            <a
              href="https://commons.wikimedia.org/w/index.php?curid=141797798"
              target="_blank"
              rel="noreferrer"
            >
              Wikimedia Commons
            </a>
          </p>
        </header>
      </section>

      <section className="login-panel">
        <div className="login-mode">
          <ColorModeToggle />
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <VStack gap={5}>
            <VStack gap={1}>
              <Heading level={2} type="display-3">
                Bon retour
              </Heading>
              <Text color="secondary">
                Sign in to pick up your trip where you left off.
              </Text>
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
            <Text color="secondary">
              New here? <Link href="/signup">Create an account</Link>
            </Text>
          </VStack>
        </form>
      </section>
    </main>
  );
}
