import logoAsset from "@/assets/logo.jpg.asset.json";

export function Brand({
  logoUrl,
  className = "",
}: {
  logoUrl?: string | null | undefined;
  className?: string;
}) {
  const src = logoUrl || logoAsset.url;
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <img
        src={src}
        alt="CCE Imports"
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover"
      />
      <span className="font-display text-base leading-none font-semibold tracking-wide">
        CCE <span className="text-gold">Imports</span>
      </span>
    </span>
  );
}
