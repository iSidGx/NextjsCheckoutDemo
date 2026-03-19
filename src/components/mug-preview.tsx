import { MugDesign, MugProduct, MugSize } from "@/domain/mugs/types";

interface MugPreviewProps {
  product: MugProduct;
  design: MugDesign;
  size: MugSize;
}

function DesignArtwork({ design }: { design: MugDesign }) {
  switch (design.id) {
    case "sunrise-stripe":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#fff8eb" />
          <rect y="18" width="280" height="18" fill="#F59E0B" opacity="0.8" />
          <rect y="52" width="280" height="12" fill="#FBBF24" />
          <rect y="84" width="280" height="10" fill="#FCD34D" />
          <circle cx="224" cy="118" r="34" fill="#F59E0B" opacity="0.22" />
          <text x="26" y="145" fontSize="24" letterSpacing="7" fill="#92400E" fontWeight="700">
            SUNRISE
          </text>
        </svg>
      );
    case "forest-note":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#eef8f1" />
          <path d="M0 160 C40 120 70 120 110 160" stroke="#2F855A" strokeWidth="8" fill="none" />
          <path d="M86 160 C126 110 162 110 210 160" stroke="#276749" strokeWidth="8" fill="none" />
          <path d="M162 160 C194 124 226 124 280 160" stroke="#166534" strokeWidth="8" fill="none" />
          <text x="28" y="56" fontSize="25" letterSpacing="6" fill="#14532D" fontWeight="700">
            NOTE
          </text>
          <line x1="28" y1="70" x2="236" y2="70" stroke="#16A34A" strokeWidth="3" />
        </svg>
      );
    case "atelier-grid":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#eff6ff" />
          {Array.from({ length: 8 }).map((_, index) => (
            <line
              key={`v-${index}`}
              x1={index * 40}
              y1="0"
              x2={index * 40}
              y2="180"
              stroke="#1D4ED8"
              strokeWidth="2"
              opacity={index % 2 === 0 ? "0.36" : "0.2"}
            />
          ))}
          {Array.from({ length: 6 }).map((_, index) => (
            <line
              key={`h-${index}`}
              x1="0"
              y1={index * 36}
              x2="280"
              y2={index * 36}
              stroke="#1D4ED8"
              strokeWidth="2"
              opacity={index % 2 === 0 ? "0.36" : "0.2"}
            />
          ))}
          <text x="74" y="104" fontSize="30" letterSpacing="8" fill="#1E3A8A" fontWeight="700">
            GRID
          </text>
        </svg>
      );
    case "berry-bloom":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#fff1f6" />
          <circle cx="78" cy="88" r="28" fill="#EC4899" opacity="0.28" />
          <circle cx="112" cy="70" r="22" fill="#DB2777" opacity="0.24" />
          <circle cx="140" cy="98" r="24" fill="#BE185D" opacity="0.2" />
          <circle cx="174" cy="80" r="20" fill="#9D174D" opacity="0.24" />
          <circle cx="202" cy="102" r="18" fill="#831843" opacity="0.22" />
          <text x="66" y="152" fontSize="24" letterSpacing="6" fill="#9D174D" fontWeight="700">
            BLOOM
          </text>
        </svg>
      );
    case "forest-canopy":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#ecfdf5" />
          <path d="M0 160 L42 88 L78 160 Z" fill="#166534" opacity="0.36" />
          <path d="M52 160 L98 74 L138 160 Z" fill="#15803D" opacity="0.36" />
          <path d="M106 160 L156 64 L198 160 Z" fill="#166534" opacity="0.36" />
          <path d="M162 160 L214 82 L258 160 Z" fill="#14532D" opacity="0.36" />
          <rect y="154" width="280" height="26" fill="#14532D" opacity="0.24" />
          <text x="38" y="50" fontSize="24" letterSpacing="6" fill="#14532D" fontWeight="700">
            FOREST
          </text>
        </svg>
      );
    case "desert-dunes":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#fffbeb" />
          <path d="M0 122 C40 96 80 98 120 122 C160 146 208 146 280 112 L280 180 L0 180 Z" fill="#F59E0B" opacity="0.26" />
          <path d="M0 142 C48 112 98 120 150 144 C196 164 236 166 280 144 L280 180 L0 180 Z" fill="#D97706" opacity="0.3" />
          <circle cx="224" cy="56" r="22" fill="#FDBA74" opacity="0.45" />
          <text x="24" y="54" fontSize="24" letterSpacing="6" fill="#92400E" fontWeight="700">
            DESERT
          </text>
        </svg>
      );
    case "sea-current":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#ecfeff" />
          <path d="M0 116 C26 106 52 106 78 116 C104 126 130 126 156 116 C182 106 208 106 234 116 C252 124 266 126 280 122" stroke="#0891B2" strokeWidth="8" fill="none" />
          <path d="M0 138 C28 128 56 128 84 138 C112 148 140 148 168 138 C196 128 224 128 252 138 C262 142 272 144 280 142" stroke="#0E7490" strokeWidth="8" fill="none" opacity="0.65" />
          <circle cx="52" cy="56" r="4" fill="#0284C7" />
          <circle cx="70" cy="46" r="3" fill="#0EA5E9" />
          <circle cx="84" cy="62" r="3" fill="#38BDF8" />
          <text x="168" y="52" fontSize="24" letterSpacing="6" fill="#0C4A6E" fontWeight="700">
            SEA
          </text>
        </svg>
      );
    case "mountain-ridge":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#f8fafc" />
          <path d="M12 160 L82 62 L146 160 Z" fill="#64748B" opacity="0.35" />
          <path d="M78 160 L154 48 L232 160 Z" fill="#334155" opacity="0.35" />
          <path d="M168 160 L228 78 L274 160 Z" fill="#475569" opacity="0.35" />
          <path d="M140 70 L154 48 L168 70" fill="#E2E8F0" />
          <text x="24" y="50" fontSize="24" letterSpacing="6" fill="#1E293B" fontWeight="700">
            RIDGE
          </text>
        </svg>
      );
    case "fox-trail":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#fff7ed" />
          <path d="M54 126 L88 84 L124 126 L108 136 L70 136 Z" fill="#C2410C" opacity="0.45" />
          <polygon points="88,84 74,66 102,66" fill="#EA580C" />
          <polygon points="88,84 102,66 116,82" fill="#FB923C" />
          <circle cx="82" cy="102" r="3" fill="#111827" />
          <circle cx="95" cy="102" r="3" fill="#111827" />
          <path d="M84 116 Q88 120 92 116" stroke="#7C2D12" strokeWidth="2" fill="none" />
          <path d="M148 144 C182 126 212 122 248 140" stroke="#C2410C" strokeWidth="7" fill="none" strokeLinecap="round" />
          <text x="150" y="60" fontSize="24" letterSpacing="5" fill="#7C2D12" fontWeight="700">
            FOX
          </text>
        </svg>
      );
    case "owl-watch":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#fafaf9" />
          <ellipse cx="114" cy="112" rx="42" ry="46" fill="#6B4F3A" opacity="0.38" />
          <circle cx="98" cy="104" r="12" fill="#fef3c7" />
          <circle cx="130" cy="104" r="12" fill="#fef3c7" />
          <circle cx="98" cy="104" r="4" fill="#1f2937" />
          <circle cx="130" cy="104" r="4" fill="#1f2937" />
          <polygon points="114,112 106,122 122,122" fill="#a16207" />
          <path d="M56 146 L170 146" stroke="#57534E" strokeWidth="5" strokeLinecap="round" />
          <text x="170" y="66" fontSize="24" letterSpacing="5" fill="#44403C" fontWeight="700">
            OWL
          </text>
        </svg>
      );
    case "whale-song":
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#eff6ff" />
          <path d="M34 118 C72 92 120 90 166 110 C180 116 198 114 214 104 C208 124 188 138 166 140 C130 146 82 144 46 132 Z" fill="#1E3A8A" opacity="0.38" />
          <path d="M122 96 Q126 76 138 66" stroke="#1D4ED8" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M126 95 Q136 80 152 84" stroke="#60A5FA" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="88" cy="112" r="3" fill="#1e293b" />
          <path d="M26 152 C64 132 104 132 142 152" stroke="#0EA5E9" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.7" />
          <text x="160" y="54" fontSize="22" letterSpacing="4" fill="#1E3A8A" fontWeight="700">
            WHALE
          </text>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 280 180" className="h-full w-full" role="img" aria-label={design.name}>
          <rect width="280" height="180" fill="#f5f5f5" />
          {Array.from({ length: 7 }).map((_, row) =>
            Array.from({ length: 11 }).map((__, col) => (
              <circle
                key={`${row}-${col}`}
                cx={20 + col * 24}
                cy={24 + row * 22}
                r="4"
                fill="#111827"
                opacity={((row + col) % 2 === 0 ? 0.38 : 0.2).toString()}
              />
            )),
          )}
          <text x="68" y="156" fontSize="22" letterSpacing="5" fill="#1F2937" fontWeight="700">
            MIDNIGHT
          </text>
        </svg>
      );
  }
}

export function MugPreview({ product, design, size }: MugPreviewProps) {
  const mugScale =
    size.id === "small"
      ? "h-44 w-36"
      : size.id === "medium"
        ? "h-52 w-40"
        : "h-60 w-44";

  const mugVariant =
    product.id === "nordic-dawn"
      ? {
          body: "rounded-t-[1.7rem] rounded-b-[2.8rem]",
          handle: "-right-8 top-[4.2rem] h-28 w-16",
          printArea: "inset-x-3 top-5 bottom-6 rounded-[1.2rem]",
        }
      : product.id === "studio-ink"
        ? {
            body: "rounded-t-[1.2rem] rounded-b-[2.1rem]",
            handle: "-right-7 top-[3.8rem] h-24 w-14",
            printArea: "inset-x-3 top-4 bottom-5 rounded-[0.9rem]",
          }
        : product.id === "cafe-cloud"
          ? {
              body: "rounded-t-[2rem] rounded-b-[2.7rem]",
              handle: "-right-8 top-[4rem] h-27 w-16",
              printArea: "inset-x-3.5 top-6 bottom-6 rounded-[1.4rem]",
            }
          : {
              body: "rounded-t-[1.5rem] rounded-b-[2.2rem]",
              handle: "-right-8 top-[4.4rem] h-26 w-16",
              printArea: "inset-x-3 top-6 bottom-6 rounded-[1rem]",
            };

  return (
    <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(245,241,232,0.8))] p-6 pb-14 pt-10 shadow-inner">
      <div className="absolute inset-x-8 top-10 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.7),transparent_68%)] blur-2xl" />
      <div className={`relative ${mugScale} transition-all duration-300`}>
        <div
          className={`relative h-full w-full border-[6px] shadow-[0_30px_50px_-30px_rgba(28,25,23,0.6)] ${mugVariant.body}`}
          style={{
            backgroundColor: product.palette.body,
            borderColor: product.palette.rim,
          }}
          aria-label={`${product.name} preview with ${design.name}`}
        >
          <div
            className={`absolute border border-white/60 ${mugVariant.printArea}`}
            style={{ backgroundColor: product.palette.surface }}
          >
            <DesignArtwork design={design} />
          </div>
          <div
            className="absolute inset-x-2 top-2 h-2 rounded-full opacity-70"
            style={{ backgroundColor: "rgba(255,255,255,0.62)" }}
          />
          {product.id === "campfire-clay" ? (
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-black/10 [background-image:radial-gradient(rgba(120,53,15,0.18)_1px,transparent_1px)] [background-size:8px_8px]" />
          ) : null}
        </div>
        <div
          className={`absolute rounded-full border-[10px] ${mugVariant.handle}`}
          style={{ borderColor: product.palette.handle }}
        />
      </div>
      <span
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.24em] text-stone-800"
        style={{ backgroundColor: `${design.accentColor}33` }}
      >
        {design.name}
      </span>
    </div>
  );
}