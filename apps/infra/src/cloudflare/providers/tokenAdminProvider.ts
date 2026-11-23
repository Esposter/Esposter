import { configuration } from "#src/configuration";
import * as cloudflare from "@pulumi/cloudflare";

// The provider the account token resources are made under. Its token is the bootstrap token, the one credential a
// Person Makes by hand, and only the token resources read it
export const tokenAdminProvider: cloudflare.Provider = new cloudflare.Provider(
  "tokenAdmin",
  { apiToken: configuration.requireSecret("CLOUDFLARE_BOOTSTRAP_API_TOKEN") },
  { protect: true },
);
