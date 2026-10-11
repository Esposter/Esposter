export const CrossOriginEmbedderPolicy = {
  Credentialless: "credentialless",
  RequireCorp: "require-corp",
  UnsafeNone: "unsafe-none",
} as const;
export type CrossOriginEmbedderPolicy = (typeof CrossOriginEmbedderPolicy)[keyof typeof CrossOriginEmbedderPolicy];
