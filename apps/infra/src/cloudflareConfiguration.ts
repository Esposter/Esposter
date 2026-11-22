import * as pulumi from "@pulumi/pulumi";

// The Cloudflare provider's own namespace.
// `cloudflare:apiToken` is the key the provider reads its token from.
// The token is set once in ESC and read here too, for the Actions secret the deploy job uses.
export const cloudflareConfiguration: pulumi.Config = new pulumi.Config("cloudflare");
