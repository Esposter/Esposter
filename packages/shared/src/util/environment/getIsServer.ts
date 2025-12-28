/// <reference lib="dom" />
export const getIsServer = (): boolean => typeof window === "undefined";
