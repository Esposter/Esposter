import * as pulumi from "@pulumi/pulumi";

// The stack's config bag, resolved once. `new pulumi.Config()` with no argument reads the same project-scoped
// Namespace wherever it is constructed, so a per-file instance is one value spelled as many times as there are
// Files that need a secret.
export const configuration: pulumi.Config = new pulumi.Config();

// The Cloudflare provider's own namespace. `cloudflare:apiToken` is the key the provider reads its token from, so the
// Token is set once in ESC and read here too, for the Actions secret the deploy job uses.
export const cloudflareConfiguration: pulumi.Config = new pulumi.Config("cloudflare");
