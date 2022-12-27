import hrtime from "browser-hrtime";

export const isServer = () => typeof window === "undefined";

// Get current epoch time in nanoseconds
export const now = () => {
  const [ms, ns] = isServer() ? process.hrtime() : hrtime();
  return (BigInt(ms) * BigInt(1e9) + BigInt(ns)).toString();
};

// #region Path constants
export const INDEX_PATH = "/";
export const LOGIN_PATH = "/login";
export const ABOUT_PATH = "/about";
export const MESSAGES_INDEX_PATH = "/messages";
export const MESSAGES_PATH = (id: string) => `/messages/${id}`;
export const POST_CREATE_PATH = "/post/create";
export const POST_UPDATE_PATH = (id: string) => `/post/update/${id}`;
export const CLICKER_PATH = "/clicker";
export const PRIVACY_POLICY_PATH = "https://www.termsfeed.com/live/367522f3-27be-4faa-a7bd-dda7b419a8fc";
export const TERMS_AND_CONDITIONS_PATH = "https://www.termsfeed.com/live/7202726c-ae87-41cd-af54-9bde6ca4477a";

export const TRPC_CLIENT_PATH = "/api/trpc";
// #endregion

export const FETCH_LIMIT = 20;

// #region Validation constants
export const USER_NAME_MAX_LENGTH = 100;
export const ROOM_NAME_MAX_LENGTH = 100;
export const MESSAGE_MAX_LENGTH = 100;
export const POST_TITLE_MAX_LENGTH = 300;
export const POST_DESCRIPTION_MAX_LENGTH = 1000;
export const CHATBOT_PROMPT_MAX_LENGTH = 100;
// #endregion
