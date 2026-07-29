// components/InstallPrompt.tsx
"use client";
import { useEffect, useState } from "react";
import type { Language } from "@/lib/types";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform =
  | "ios-safari"
  | "ios-chrome"
  | "ios-firefox"
  | "ios-other"
  | "android-chrome"
  | "android-firefox"
  | "android-other"
  | "desktop-chrome"
  | "desktop-other"
  | "unknown";

function getPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  const isAndroid = /android/i.test(ua);
  const isSafari = /^((?!chrome|android|fxios|crios).)*safari/i.test(ua);
  const isChrome = /crios|chrome/i.test(ua) && !/edg/i.test(ua);
  const isFirefox = /fxios|firefox/i.test(ua);

  if (isIos) {
    if (isSafari) return "ios-safari";
    if (isChrome) return "ios-chrome";
    if (isFirefox) return "ios-firefox";
    return "ios-other";
  }
  if (isAndroid) {
    if (isChrome) return "android-chrome";
    if (isFirefox) return "android-firefox";
    return "android-other";
  }
  if (isChrome) return "desktop-chrome";
  return "desktop-other";
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

const INSTRUCTIONS: Record<Platform, Record<Language, string[]>> = {
  "ios-safari": {
    en: [
      "You're already using Safari — great!",
      '1. Tap the Share button ↑ at the bottom of the screen',
      '2. Scroll down and tap "Add to Home Screen"',
      '3. Tap "Add" in the top right',
    ],
    es: [
      "¡Ya estás usando Safari — perfecto!",
      "1. Toca el botón Compartir ↑ en la parte inferior de la pantalla",
      '2. Desplázate hacia abajo y toca "Agregar a pantalla de inicio"',
      '3. Toca "Agregar" en la esquina superior derecha',
    ],
  },
  "ios-chrome": {
    en: [
      "To install on iPhone, you need to use Safari.",
      "1. Copy this link: despeja.vercel.app",
      "2. Open Safari 🧭 (the blue compass app)",
      "3. Paste the link and go",
      '4. Tap Share ↑ → "Add to Home Screen"',
    ],
    es: [
      "Para instalar en iPhone, necesitas usar Safari.",
      "1. Copia este enlace: despeja.vercel.app",
      "2. Abre Safari 🧭 (la app de la brújula azul)",
      "3. Pega el enlace y ve",
      '4. Toca Compartir ↑ → "Agregar a pantalla de inicio"',
    ],
  },
  "ios-firefox": {
    en: [
      "To install on iPhone, you need to use Safari.",
      "1. Copy this link: despeja.vercel.app",
      "2. Open Safari 🧭 (the blue compass app)",
      "3. Paste the link and go",
      '4. Tap Share ↑ → "Add to Home Screen"',
    ],
    es: [
      "Para instalar en iPhone, necesitas usar Safari.",
      "1. Copia este enlace: despeja.vercel.app",
      "2. Abre Safari 🧭 (la app de la brújula azul)",
      "3. Pega el enlace y ve",
      '4. Toca Compartir ↑ → "Agregar a pantalla de inicio"',
    ],
  },
  "ios-other": {
    en: [
      "To install on iPhone, open this page in Safari.",
      "1. Copy: despeja.vercel.app",
      "2. Open Safari 🧭",
      '3. Tap Share ↑ → "Add to Home Screen"',
    ],
    es: [
      "Para instalar en iPhone, abre esta página en Safari.",
      "1. Copia: despeja.vercel.app",
      "2. Abre Safari 🧭",
      '3. Toca Compartir ↑ → "Agregar a pantalla de inicio"',
    ],
  },
  "android-chrome": {
    en: [
      "You can install Despeja directly from Chrome!",
      '1. Tap the menu ⋮ in the top right',
      '2. Tap "Add to Home screen"',
      '3. Tap "Add"',
    ],
    es: [
      "¡Puedes instalar Despeja directamente desde Chrome!",
      "1. Toca el menú ⋮ en la esquina superior derecha",
      '2. Toca "Agregar a pantalla de inicio"',
      '3. Toca "Agregar"',
    ],
  },
  "android-firefox": {
    en: [
      "You can install Despeja from Firefox!",
      '1. Tap the menu ⋮ in the top right',
      '2. Tap "Install"',
      '3. Tap "Add"',
    ],
    es: [
      "¡Puedes instalar Despeja desde Firefox!",
      "1. Toca el menú ⋮ en la esquina superior derecha",
      '2. Toca "Instalar"',
      '3. Toca "Agregar"',
    ],
  },
  "android-other": {
    en: [
      "To install, open this page in Chrome on your Android.",
      "1. Copy: despeja.vercel.app",
      "2. Open Chrome",
      '3. Tap menu ⋮ → "Add to Home screen"',
    ],
    es: [
      "Para instalar, abre esta página en Chrome en tu Android.",
      "1. Copia: despeja.vercel.app",
      "2. Abre Chrome",
      '3. Toca menú ⋮ → "Agregar a pantalla de inicio"',
    ],
  },
  "desktop-chrome": {
    en: [
      "You can install Despeja on your computer!",
      "1. Look for the install icon (⊕) in the address bar",
      "2. Click it and select Install",
      "Or: click the menu ⋮ → Cast, save, and share → Install page as app",
    ],
    es: [
      "¡Puedes instalar Despeja en tu computadora!",
      "1. Busca el ícono de instalación (⊕) en la barra de direcciones",
      "2. Haz clic y selecciona Instalar",
      "O: menú ⋮ → Instalar página como aplicación",
    ],
  },
  "desktop-other": {
    en: [
      "To install Despeja, open it in Chrome or Edge on your computer.",
      "Look for the install icon (⊕) in the address bar and click it.",
    ],
    es: [
      "Para instalar Despeja, ábrelo en Chrome o Edge en tu computadora.",
      "Busca el ícono de instalación (⊕) en la barra de direcciones y haz clic.",
    ],
  },
  unknown: {
    en: ["Open despeja.vercel.app in Safari (iPhone) or Chrome (Android) to install."],
    es: ["Abre despeja.vercel.app en Safari (iPhone) o Chrome (Android) para instalar."],
  },
};

export default function InstallPrompt({ lang }: { lang: Language }) {
  const [androidPrompt, setAndroidPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [showModal, setShowModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    setPlatform(getPlatform());

    const handler = (e: Event) => {
      e.preventDefault();
      setAndroidPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isInStandaloneMode()) return null;

  const steps = INSTRUCTIONS[platform]?.[lang] ?? INSTRUCTIONS.unknown[lang];

  async function handleAndroidInstall() {
    if (!androidPrompt) return;
    await androidPrompt.prompt();
    const { outcome } = await androidPrompt.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      setAndroidPrompt(null);
      setBannerDismissed(true);
    }
  }

  return (
    <>
      {/* Auto banner for Android Chrome native install */}
      {androidPrompt && !bannerDismissed && (
        <div className="install-banner" role="banner">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <PhoneIcon />
            <span className="text-sm">
              {lang === "es"
                ? "Agrega Despeja a tu pantalla de inicio."
                : "Add Despeja to your home screen."}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={handleAndroidInstall}
              className="rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
              {lang === "es" ? "Instalar" : "Install"}
            </button>
            <button type="button" onClick={() => setBannerDismissed(true)} aria-label="Dismiss"
              className="rounded-full p-1.5 text-white/60 hover:text-white">
              <CloseIcon />
            </button>
          </div>
        </div>
      )}

      {/* Install modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-ink">
                {lang === "es" ? "📱 Instalar Despeja" : "📱 Install Despeja"}
              </h2>
              <button type="button" onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-muted hover:text-ink">
                <CloseIcon />
              </button>
            </div>
            <ul className="space-y-3">
              {steps.map((step, i) => (
                <li key={i} className={`text-sm ${i === 0 ? "font-semibold text-brand" : "text-ink"}`}>
                  {step}
                </li>
              ))}
            </ul>
            {androidPrompt && (
              <button type="button" onClick={handleAndroidInstall}
                className="mt-5 w-full rounded-full bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
                {lang === "es" ? "Instalar ahora" : "Install now"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Persistent footer trigger — always visible */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-full bg-ink/90 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-ink"
        >
          <PhoneIcon />
          {lang === "es" ? "Instalar app" : "Install app"}
        </button>
      </div>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
