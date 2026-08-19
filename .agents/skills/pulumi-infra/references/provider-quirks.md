# Azure Native and GitHub provider quirks

Read when picking an Azure Native resource token, naming a Logic App API connection, or touching the GitHub `Repository` resource and its branch protection.

## Azure Native resource tokens

Use tokens matching the installed provider version. For Azure Native v3:

- Action Groups: `azure-native:monitor:ActionGroup`
- Budgets: `azure-native:consumption:Budget`
- Event Grid subscriptions: `azure-native:eventgrid:EventSubscription`

Logic App API connections may have live names like `azureappservice-1`, `azureappservice-2`, `arm`, `arm-1` — don't assume the spreadsheet naming-convention names are the live Azure resource names.

## GitHub branch auto-delete

GitHub's repository `deleteBranchOnMerge` is a system action that **bypasses ruleset deletion rules**, so it deletes a long-lived branch on merge even when the ruleset protects that ref from deletion. Keep `deleteBranchOnMerge: false` on the `Repository` resource and clean merged head branches up via the `Delete Merged Branch` GH Actions workflow (`.github/workflows/DeleteMergedBranch.yaml`), which excludes `main`/`develop` explicitly. Don't rely on rulesets to protect long-lived branches from native auto-delete.
