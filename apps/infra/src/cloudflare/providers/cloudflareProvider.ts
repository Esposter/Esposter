import { tokEsposterInfra } from "#src/cloudflare/resources/accountTokens/tokEsposterInfra";
import * as cloudflare from "@pulumi/cloudflare";

// The provider every Cloudflare resource the program declares is made under. Its token is the infra token's value, so
// The Program holds no credential of its own, and the infra token is created before this provider is configured
export const cloudflareProvider: cloudflare.Provider = new cloudflare.Provider(
  "cloudflare",
  { apiToken: tokEsposterInfra.value },
  { protect: true },
);
