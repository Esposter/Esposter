// The environment token every Cloudflare resource name starts with, as Azure's names do. Both environments live in one
// Account, so the token is always written, never implied by its absence
export const CloudflareEnvironment = { Development: "dev", Production: "prod" } as const;
export type CloudflareEnvironment = (typeof CloudflareEnvironment)[keyof typeof CloudflareEnvironment];
