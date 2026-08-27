/// <reference lib="dom" />
export const checkIsServer = (): boolean => typeof window === "undefined";
