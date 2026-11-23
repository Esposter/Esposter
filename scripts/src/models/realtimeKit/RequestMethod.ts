// The HTTP methods the provisioning's Cloudflare calls make
export const RequestMethod = { Get: "GET", Patch: "PATCH", Post: "POST" } as const;
export type RequestMethod = (typeof RequestMethod)[keyof typeof RequestMethod];
