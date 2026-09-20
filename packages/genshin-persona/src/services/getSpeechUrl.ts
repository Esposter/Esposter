const TRAILING_SLASH_REGEX = /\/$/u;

// The endpoint is typed by a person into a configuration dialog, so it arrives with or without its trailing slash
export const getSpeechUrl = (endpoint: string, path: string): string =>
  `${endpoint.replace(TRAILING_SLASH_REGEX, "")}${path}`;
