// components/InstallPrompt.tsx
// PWA install support:
// - Android/Chrome: uses beforeinstallprompt for a native install banner
// - iOS/Safari: Safari doesn't support beforeinstallprompt, so we show
//   manual instructions ("tap Share → Add to Home Screen")
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

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches;
}

export default function InstallPrompt({ lang }: { lang: Language }) {
  const [androidPrompt, setAndroidPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInStandaloneMode()) return;

    // iOS: show manual instructions
    if (isIos()) {
      // Small delay so it doesn't flash on first load
      const timer = setTimeout(() => setShowIos(true), 2500);
      return () => clearTimeout(timer);
    }

    // Android/Chrome: listen for native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setAndroidPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed) return null;

  // Android native install banner
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
      <div className="install-banner" role="banner">
        <div className="flex items-center gap-3">
          <PhoneIcon />
          <span>
            {lang === "es"
              ? "Agrega Despeja a tu pantalla de inicio — funciona sin internet."
              : "Add Despeja to your home screen — works without internet."}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={install}
            className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
            {lang === "es" ? "Instalar" : "Install"}
          </button>
          <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss"
            className="rounded-full p-1.5 text-white/60 hover:text-white">
            <CloseIcon />
          </button>
        </div>
      </div>
    );
  }

  // iOS manual instructions banner
  if (showIos) {
    return (
      <div className="install-banner" role="banner">
        <div className="flex flex-col gap-1">
          <span className="font-semibold">
            {lang === "es" ? "Instala Despeja en tu iPhone:" : "Install Despeja on your iPhone:"}
          </span>
          <span className="text-white/80 text-sm">
            {lang === "es"
              ? "Toca el botón Compartir  ↑  en Safari → \"Agregar a pantalla de inicio\""
              : 'Tap the Share button ↑ in Safari → "Add to Home Screen"'}
          </span>
        </div>
        <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss"
          className="ml-4 shrink-0 rounded-full p-1.5 text-white/60 hover:text-white">
          <CloseIcon />
        </button>
      </div>
    );
  }

  return null;
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
