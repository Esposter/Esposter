import * as pulumi from "@pulumi/pulumi";

// The stack's config bag, resolved once.
// `new pulumi.Config()` with no argument reads the same project-scoped namespace wherever it is constructed.
// A per-file instance would be one value spelled once per file that needs a secret.
export const configuration: pulumi.Config = new pulumi.Config();
