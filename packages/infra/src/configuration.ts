import * as pulumi from "@pulumi/pulumi";

// The stack's config bag, resolved once. `new pulumi.Config()` with no argument reads the same project-scoped
// Namespace wherever it is constructed, so a per-file instance is one value spelled as many times as there are
// Files that need a secret.
export const configuration: pulumi.Config = new pulumi.Config();
