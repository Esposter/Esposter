import type * as pulumi from "@pulumi/pulumi";

import { tokenAdminProvider } from "#src/cloudflare/providers/tokenAdminProvider";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import * as cloudflare from "@pulumi/cloudflare";

// A permission group's id, read by its name from the provider's data source.
// A token names its groups this way, so a group the account does not carry fails the preview by name, and no id is
// Written into the program
export const getAccountTokenPermissionGroupId = (name: string): pulumi.Output<string> =>
  cloudflare
    .getAccountApiTokenPermissionGroupsListOutput(
      { accountId: CLOUDFLARE_ACCOUNT_ID, name },
      { provider: tokenAdminProvider },
    )
    .apply(({ results }) => {
      const permissionGroup = results.find((result) => result.name === name);
      if (!permissionGroup)
        throw new InvalidOperationError(Operation.Read, name, "is not a permission group of this account");
      return permissionGroup.id;
    });
