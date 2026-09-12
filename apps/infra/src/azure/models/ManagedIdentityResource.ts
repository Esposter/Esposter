import type * as pulumi from "@pulumi/pulumi";

export interface ManagedIdentityResource extends pulumi.CustomResource {
  readonly identity: pulumi.Output<undefined | { principalId: string }>;
}
