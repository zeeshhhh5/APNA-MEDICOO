"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, t as translate } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem("apna-medico-lang") as Language | null;
    if (stored) setLang(stored);
  }, []);

  const setLanguage = (lang: Language) => {
    setLang(lang);
    localStorage.setItem("apna-medico-lang", lang);
  };

  const t = (key: string) => translate(key, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
