import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/site/Brand";
import { btnGhost, btnGold } from "@/components/site/buttons";
import { ensureAuthorizedAdmin } from "@/lib/admin.functions";

const AUTHORIZED_ADMIN_EMAIL = "contato.cceimports.com.br@gmail.com";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Acesso administrativo | CCE Imports" },
      { name: "description", content: "Área restrita da equipe CCE Imports." },
      { property: "og:title", content: "Acesso administrativo | CCE Imports" },
      { property: "og:description", content: "Área restrita da equipe CCE Imports." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const authorizeAdmin = useServerFn(ensureAuthorizedAdmin);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      setError("Não foi possível entrar. Confira o e-mail e a senha.");
      return;
    }
    try {
      await authorizeAdmin();
    } catch {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Esta conta não possui autorização administrativa.");
      return;
    }
    setLoading(false);
    navigate({ to: "/admin", replace: true });
  }

  async function createAuthorizedAccount() {
    setError(null);
    setNotice(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
      setError("Somente o e-mail autorizado pode criar o acesso administrativo.");
      return;
    }
    if (password.length < 8) {
      setError("Crie uma senha com pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { emailRedirectTo: window.location.origin + "/admin/login" },
    });
    setLoading(false);
    if (signUpError) {
      setError("Não foi possível criar a conta. Se ela já existir, use o botão Entrar.");
      return;
    }
    if (!data.session) {
      setNotice("Conta criada. Abra o e-mail de confirmação e depois volte para entrar.");
      return;
    }
    await authorizeAdmin();
    navigate({ to: "/admin", replace: true });
  }

  return (
    <main className="container-cce flex min-h-screen max-w-md flex-col justify-center py-12">
      <Brand />
      <h1 className="font-display mt-6 text-2xl font-semibold">Acesso administrativo</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Área restrita da equipe. Clientes não precisam de conta para comprar.
      </p>
      <form onSubmit={onSubmit} className="surface-card mt-6 space-y-4 p-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-border bg-elevated px-3 py-2 text-sm"
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-whats">
            {notice}
          </p>
        )}
        <button type="submit" className={`${btnGold} w-full`} disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
        <button
          type="button"
          className={`${btnGhost} w-full`}
          disabled={loading}
          onClick={createAuthorizedAccount}
        >
          Criar primeiro acesso autorizado
        </button>
      </form>
    </main>
  );
}
