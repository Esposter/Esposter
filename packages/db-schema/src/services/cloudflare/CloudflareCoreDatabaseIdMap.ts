import { CloudflareEnvironment } from "#src/models/cloudflare/CloudflareEnvironment";

// The id of each environment's `core` D1 database.
// An id is not a secret and never changes, so it is committed.
// The web app, each Worker's wrangler config and the migrations read it from here.
// Each Worker's wrangler test holds its config to it.
export const CloudflareCoreDatabaseIdMap = {
  [CloudflareEnvironment.Development]: "0973f2df-a1f0-4d43-a801-663b0698503b",
  [CloudflareEnvironment.Production]: "08a5061a-0fbb-487e-883e-f6b660cffce2",
} as const satisfies Record<CloudflareEnvironment, string>;
