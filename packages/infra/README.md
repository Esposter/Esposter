# Esposter Infrastructure

This folder owns the Pulumi migration for the existing Azure infrastructure that was previously tracked in spreadsheets.

Phase 1 is an adoption pass: preserve the spreadsheet exports, generate a Pulumi bulk import manifest, import the live Azure resources into Pulumi state, paste the generated resource code into `src/importedResources.ts`, then iterate until `pulumi preview` reports no changes.

## Source Data

The current spreadsheet exports live in `data/`:

- `Azure Assets - Assets.csv` is the resource inventory.
- `Azure Assets - Reference.csv` is the naming convention and asset type reference.
- `Azure Assets - Regions.csv` maps display regions to Azure location names and short codes.

The assets export currently contains 51 resource rows plus the spreadsheet stop marker, including development and production resource groups, storage accounts, Function Apps, Web PubSub, Event Grid topics/subscriptions, Logic Apps, API connections, budgets, action groups, alert actions, Application Insights, Log Analytics, Cognitive Search, and Speech.

## Workflow

1. Authenticate Azure locally:

   ```powershell
   az login
   az account set --subscription "<subscription-id>"
   ```

2. Select or create the Pulumi stack:

   ```powershell
   cd packages/infra
   pulumi stack select dev
   pulumi config set azure-native:subscriptionId "<subscription-id>"
   ```

3. Generate the import files from the CSV:

   ```powershell
   $env:AZURE_SUBSCRIPTION_ID = "<subscription-id>"
   pnpm inventory:build
   ```

4. Review `generated/azure-import-review.md`. Anything listed there needs a hand-filled Pulumi token, parent resource ID, or Azure-specific scope before import.

5. Import the ready resources:

   ```powershell
   pnpm import
   ```

6. Copy the resource code printed by Pulumi into `src/importedResources.ts`, import it from `src/main.ts`, then run:

   ```powershell
   pnpm preview
   ```

The target for phase 1 is a clean preview with no create, update, replace, or delete operations.

## Import Notes

Pulumi's Azure Native provider is the default here because it is Pulumi's ARM-backed Azure provider and the Pulumi registry currently lists Azure Native v3.18.0 as the latest version. Pulumi's import docs support bulk imports using a JSON file with `type`, `name`, and `id` fields, which is exactly what `scripts/buildAzureImportManifest.ts` emits.

Some resource categories need extra care:

- Budgets may be subscription-scoped or resource-group-scoped. Confirm the exact Azure resource ID before importing.
- Event Grid subscriptions are children of a topic, domain, storage account, or another event source. The CSV name alone is not enough to infer the parent.
- Azure Monitor "actions" need classification. They may be metric alerts, scheduled query rules, processing rules, or another Insights resource.
- Logic Apps and API connections should be imported before any refactor. Their workflow definitions and connection parameters should be copied from Azure exactly during phase 1.
- Update repository and package README files once phase 1 settles so the infra workflow is visible from the root docs and not only from this package.

## References

- [Pulumi import docs](https://www.pulumi.com/docs/iac/guides/migration/import/)
- [Pulumi Azure Native provider docs](https://www.pulumi.com/registry/packages/azure-native/)
- [Azure Native installation and authentication](https://www.pulumi.com/registry/packages/azure-native/installation-configuration/)
