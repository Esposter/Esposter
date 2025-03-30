import type { Extension } from "@codemirror/state";

import { extendedLanguages } from "@/services/codemirror/extendedLanguages";

export const getLanguageExtension = async (language: string): Promise<Extension[]> => {
  const languageRequested = extendedLanguages.find(({ name }) => name === language);
  return languageRequested ? [await languageRequested.load()] : [];
};
