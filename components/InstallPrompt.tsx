// components/InstallPrompt.tsx
"use client";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/types";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isSafari() {
  if (typeof navigator === "undefined") return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export default function InstallPrompt({ lang }: { lang: Language }) {
  const [androidPrompt, setAndroidPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosState, setIosState] = useState<"hidden" | "not-safari" | "safari">("hidden");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;

    if (isIos()) {
      const timer = setTimeout(() => {
        setIosState(isSafari() ? "safari" : "not-safari");
      }, 1500);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setAndroidPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed) return null;

  // Android native install
  if (androidPrompt) {
    const install = async () => {
      await androidPrompt.prompt();
      const { outcome } = await androidPrompt.userChoice;
      if (outcome === "accepted" || outcome === "dismissed") {
        setDismissed(true);
        setAndroidPrompt(null);
      }
    };
    return (
      <Banner onDismiss={() => setDismissed(true)}>
        <span>
          {lang === "es"
            ? "Agrega Despeja a tu pantalla de inicio — funciona sin internet."
            : "Add Despeja to your home screen — works without internet."}
        </span>
        <button
          type="button"
          onClick={install}
          className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark shrink-0"
        >
          {lang === "es" ? "Instalar" : "Install"}
        </button>
      </Banner>
    );
  }

  // iOS in Safari — show native install instructions
  if (iosState === "safari") {
    return (
      <Banner onDismiss={() => setDismissed(true)}>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-sm">
            {lang === "es" ? "Instala Despeja en tu iPhone:" : "Install Despeja on your iPhone:"}
          </span>
          <span className="text-white/80 text-xs">
            {lang === "es"
              ? 'Toca Compartir  ↑  → "Agregar a pantalla de inicio"'
              : 'Tap Share ↑ below → "Add to Home Screen"'}
          </span>
        </div>
      </Banner>
    );
  }

  // iOS but NOT in Safari — tell them to switch
  if (iosState === "not-safari") {
    return (
      <Banner onDismiss={() => setDismissed(true)}>
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-sm">
            {lang === "es"
              ? "¿Quieres instalar esta app?"
              : "Want to install this app?"}
          </span>
          <span className="text-white/80 text-xs">
            {lang === "es"
              ? "Abre esta página en Safari para agregarla a tu pantalla de inicio. 🧭"
              : "Open this page in Safari to add it to your home screen. 🧭"}
          </span>
        </div>
      </Banner>
    );
  }

  return null;
}

function Banner({
  children,
  onDismiss,
}: {
  children: React.ReactNode;
  onDismiss: () => void;
}) {
  return (
    <div className="install-banner" role="banner">
      <div className="flex items-center gap-3 flex-1 min-w-0">{children}</div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="ml-3 shrink-0 rounded-full p-1.5 text-white/60 hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
