import { MessageCircle } from "lucide-react";
import { WA_GENERAL, waLink } from "@/lib/store";

export function WhatsAppFab() {
  return (
    <a
      href={waLink(WA_GENERAL)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className="bg-whats text-whats-foreground focus-visible:outline-ring fixed right-4 bottom-4 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-lg focus-visible:outline-2"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <MessageCircle size={24} aria-hidden />
    </a>
  );
}
