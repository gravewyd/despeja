// components/icons.tsx
import type { SVGProps } from "react";

const I = (p: SVGProps<SVGSVGElement>, sw = 2) => ({
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...p,
});

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
      <rect x="46" y="26" width="8" height="26" rx="4" transform="rotate(0 50 63)" />
      <rect x="46.25" y="31" width="30" height="31" rx="3.75" transform="rotate(-32 50 63)" />
      <rect x="46.25" y="31" width="30" height="31" rx="3.75" transform="rotate(32 50 63)" />
      <rect x="46.5" y="37.5" width="29.5" height="24.5" rx="3.5" transform="rotate(-60 50 63)" />
      <rect x="46.5" y="37.5" width="29.5" height="24.5" rx="3.5" transform="rotate(60 50 63)" />
      <circle cx="50" cy="63" r="10" />
    </svg>
  );
}
export const Home = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" /></svg>);
export const FileText = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h6" /></svg>);
export const Mail = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>);
export const Pen = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>);
export const Calendar = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><rect x="3" y="4.5" width="18" height="16" rx="2" /><path d="M3 9h18M8 2.5v4M16 2.5v4" /></svg>);
export const Check = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M20 6 9 17l-5-5" /></svg>);
export const Alert = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M10.3 3.5 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0Z" /><path d="M12 9v5M12 17.5v.01" /></svg>);
export const Clock = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const Upload = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 9l5-5 5 5M12 4v12" /></svg>);
export const Sparkle = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" /></svg>);
export const ArrowRight = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const ExternalLink = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>);
export const Chevron = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="m6 9 6 6 6-6" /></svg>);
export const Globe = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>);
export const Trash = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" /></svg>);
export const Plus = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const Info = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></svg>);
export const Shield = (p: SVGProps<SVGSVGElement>) => (<svg {...I(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>);
