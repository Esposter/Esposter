import { extendedLanguages } from "@/services/codemirror/extendedLanguages";
import type { Extension } from "@codemirror/state";
import { Compartment } from "@codemirror/state";

export const getLanguageExtension = async (language: string): Promise<Extension[]> => {
  const languageRequested = extendedLanguages.find((l) => l.name === language);
  if (!languageRequested) return [];

  const languageSupport = await languageRequested.load();
  const compartment = new Compartment();
  return [compartment.of(languageSupport)];
};
