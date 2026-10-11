import { PROMPT_PREVIEW_LENGTH } from "#src/services/usage/constants";

// The start of a prompt on one line, its newlines read as spaces
export const formatPromptPreview = (prompt: string): string =>
  prompt.replaceAll(/\r?\n/gu, " ").slice(0, PROMPT_PREVIEW_LENGTH);
