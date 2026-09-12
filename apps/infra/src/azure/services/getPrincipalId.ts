import { InvalidOperationError, Operation } from "@esposter/shared";
import * as pulumi from "@pulumi/pulumi";

interface ManagedIdentityResource extends pulumi.CustomResource {
  readonly identity: pulumi.Output<undefined | { principalId: string }>;
}

// The provider types every identity output as optional because a resource can be declared without one; every
// Resource assigned a role here declares a system-assigned identity, so an absent one is a program error
export const getPrincipalId = (resource: ManagedIdentityResource): pulumi.Output<string> =>
  pulumi.all([resource.urn, resource.identity]).apply(([urn, identity]) => {
    if (!identity) throw new InvalidOperationError(Operation.Read, urn, "the resource declares no identity");
    return identity.principalId;
  });
