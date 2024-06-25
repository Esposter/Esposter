import { extendedLanguages } from "@/services/codemirror/extendedLanguages";
import type { Extension } from "@codemirror/state";

export const getLanguageExtension = async (language: string): Promise<Extension[]> => {
  const languageRequested = extendedLanguages.find((l) => l.name === language);
  return languageRequested ? [await languageRequested.load()] : [];
};
