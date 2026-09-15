const BACKTICKED_TOKEN_REGEX = /`(?<token>[^`\n]+)`/gu;

// Every single-backtick token of a page's citing text, which is where a page cites a path, a skill or a name
export const getBacktickedTokens = (text: string): string[] =>
  Array.from(text.matchAll(BACKTICKED_TOKEN_REGEX), (match) => match.groups?.token ?? "");
