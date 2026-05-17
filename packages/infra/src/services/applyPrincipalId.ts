import type { IdentityLike } from "@/models/IdentityLike";

import { InvalidOperationError, Operation } from "@esposter/shared";
import * as pulumi from "@pulumi/pulumi";

export const applyPrincipalId = (
  identity: pulumi.Output<IdentityLike | undefined>,
  resourceName: pulumi.Output<string>,
): pulumi.Output<string> =>
  pulumi.all([identity, resourceName]).apply(([id, name]) => {
    if (!id?.principalId)
      throw new InvalidOperationError(
        Operation.Read,
        name,
        "principalId is missing — ensure the resource has a system-assigned identity enabled",
      );
    return id.principalId;
  });
