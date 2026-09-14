import type { Extension } from "@codemirror/state";

import { EXTENDED_LANGUAGES } from "@/services/codemirror/constants";

export const getLanguageExtension = async (language: string): Promise<Extension[]> => {
  const languageRequested = EXTENDED_LANGUAGES.find(({ name }) => name === language);
  return languageRequested ? [await languageRequested.load()] : [];
};
