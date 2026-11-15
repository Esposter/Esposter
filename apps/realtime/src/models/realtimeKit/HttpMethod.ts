export const HttpMethod = { Patch: "PATCH", Post: "POST" } as const;
export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];
