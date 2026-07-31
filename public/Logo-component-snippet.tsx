// Drop-in replacement for the `Logo` export in components/icons.tsx.
// Leave every other export in that file untouched — just swap this one.
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
      <rect x="46" y="26" width="8" height="26" rx="4" transform="rotate(0 50 63)" />
      <rect x="46.25" y="31" width="7.5" height="21" rx="3.75" transform="rotate(-32 50 63)" />
      <rect x="46.25" y="31" width="7.5" height="21" rx="3.75" transform="rotate(32 50 63)" />
      <rect x="46.5" y="37.5" width="7" height="14.5" rx="3.5" transform="rotate(-60 50 63)" />
      <rect x="46.5" y="37.5" width="7" height="14.5" rx="3.5" transform="rotate(60 50 63)" />
      <circle cx="50" cy="63" r="10" />
    </svg>
  );
}
