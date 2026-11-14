// The app, shared and root programs reach the server's modules through the router's, auth's and server routes' types,
// But hold no Workers globals, whose `Request` and `Response` would replace the DOM's. The one export those modules read is declared here,
// Typed by the same bindings the server program's `Cloudflare.Env` extends
declare module "cloudflare:workers" {
  import type { CloudflareEnv } from "#server/types/cloudflare";

  export const env: CloudflareEnv;
}
