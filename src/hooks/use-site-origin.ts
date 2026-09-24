import { useEffect, useState } from "react";
import { PUBLIC_SITE_URL, resolveSiteOrigin } from "@/lib/site-url";

/**
 * Endereço público do site no navegador atual (domínio próprio incluído).
 * Começa no endereço oficial para o HTML do servidor e do navegador combinarem.
 */
export function useSiteOrigin(): string {
  const [origin, setOrigin] = useState(PUBLIC_SITE_URL);
  useEffect(() => {
    setOrigin(resolveSiteOrigin(window.location.origin));
  }, []);
  return origin;
}
