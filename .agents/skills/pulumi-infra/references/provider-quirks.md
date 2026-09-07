# Azure Native and GitHub provider quirks

Read when picking an Azure Native resource token, naming a Logic App API connection, or touching the GitHub `Repository` resource and its branch protection.

## Azure Native resource tokens

Use tokens matching the installed provider version. For Azure Native v3:

- Action Groups: `azure-native:monitor:ActionGroup`
- Budgets: `azure-native:consumption:Budget`
- Event Grid subscriptions: `azure-native:eventgrid:EventSubscription`

Logic App API connections may have live names like `azureappservice-1`, `azureappservice-2`, `arm`, `arm-1` — don't assume the spreadsheet naming-convention names are the live Azure resource names.

An `ApiReferenceArgs` block is the connector's own published metadata, so it is identical in both stacks — only the connection's own name and resource group differ. Declare it once as a shared constant rather than per stack.

Azure rotates that metadata on its own — `iconUri` moves to a new CDN host and connector version — so a stack the estate has not applied in a while previews the connections as `~properties` with only `api.iconUri` differing. The pinned constant is the stale side of that diff, and applying it pushes the older URL back over the live one. Converge by re-pinning the constant to the value the preview reports as current, never by applying the plan as it stands.

## GitHub branch auto-delete

GitHub's repository `deleteBranchOnMerge` is a system action that **bypasses ruleset deletion rules**, so it deletes a long-lived branch on merge even when the ruleset protects that ref from deletion. Keep `deleteBranchOnMerge: false` on the `Repository` resource and clean merged head branches up via the `Delete Merged Branch` GH Actions workflow (`.github/workflows/DeleteMergedBranch.yaml`), which excludes `main`/`develop` explicitly. Don't rely on rulesets to protect long-lived branches from native auto-delete.
