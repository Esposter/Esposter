import hrtime from "browser-hrtime";

export const isServer = () => typeof window === "undefined";

// Get current epoch time in nanoseconds
export const now = () => {
  const [ms, ns] = isServer() ? process.hrtime() : hrtime();
  return (BigInt(ms) * BigInt(1e9) + BigInt(ns)).toString();
};

export const FETCH_LIMIT = 20;

export const USER_USERNAME_MAX_LENGTH = 100;
export const ROOM_NAME_MAX_LENGTH = 100;
export const MESSAGE_MAX_LENGTH = 100;
export const POST_TITLE_MAX_LENGTH = 300;
export const POST_DESCRIPTION_MAX_LENGTH = 1000;
export const CHATBOT_PROMPT_MAX_LENGTH = 100;
