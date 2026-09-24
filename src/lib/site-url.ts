/**
 * Endereço público oficial do site. Usado quando o endereço atual do navegador
 * é uma pré-visualização interna (ou o servidor ainda não conhece o domínio).
 */
export const PUBLIC_SITE_URL = "https://tidy-react-base.lovable.app";

function isInternalHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".localhost") ||
    hostname.includes("id-preview") ||
    hostname.endsWith("-dev.lovable.app") ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.endsWith(".lovable.dev")
  );
}

/**
 * Devolve o endereço público que deve aparecer nas mensagens.
 * Domínio próprio ou domínio publicado são usados como estão; pré-visualizações
 * e ambiente local caem para o endereço público oficial.
 */
export function resolveSiteOrigin(origin?: string | null): string {
  if (!origin) return PUBLIC_SITE_URL;
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:") return PUBLIC_SITE_URL;
    if (isInternalHost(url.hostname)) return PUBLIC_SITE_URL;
    return `https://${url.host}`;
  } catch {
    return PUBLIC_SITE_URL;
  }
}
