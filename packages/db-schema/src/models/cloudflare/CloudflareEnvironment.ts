// The environment token every Cloudflare resource name starts with. Both environments live in one account, so the token
// Is always written, never implied by its absence
export const CloudflareEnvironment = { Development: "dev", Production: "prod" } as const;
export type CloudflareEnvironment = (typeof CloudflareEnvironment)[keyof typeof CloudflareEnvironment];

export const CloudflareEnvironments = Object.values(CloudflareEnvironment);
