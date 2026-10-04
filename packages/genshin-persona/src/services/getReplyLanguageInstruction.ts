// In the session's context beside the card rather than in the output style, which is one shipped file the same for
// Everybody; absent at English
export const getReplyLanguageInstruction = (language: string): string =>
  `Write every reply in ${language}, the character's spoken lines included. This applies to prose only, and to nothing the output style already excludes from the character's voice: code, comments, commit messages, file contents, commands and error text stay as they are.`;
