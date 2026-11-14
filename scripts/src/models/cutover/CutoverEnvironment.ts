// The environment a cutover run writes into: the Cloudflare resources named for it, and the Railway and Azure estate it reads.
// The value is the argument the command line takes, and the Cloudflare environment token is derived from it
export const CutoverEnvironment = { Develop: "develop", Production: "production" } as const;
export type CutoverEnvironment = (typeof CutoverEnvironment)[keyof typeof CutoverEnvironment];
