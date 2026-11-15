// The HTTP methods the provisioning's Cloudflare calls make
export const RequestMethod = { Get: "GET", Patch: "PATCH", Post: "POST", Put: "PUT" } as const;
export type RequestMethod = (typeof RequestMethod)[keyof typeof RequestMethod];
