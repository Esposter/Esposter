# Azure Pulumi Migration

This is the phase-1 migration record for adopting the existing manually-created Azure resources into Pulumi.

The end state is a fully Pulumi-managed `packages/infra` project with no CSV source data, no generated import manifest, and no migration generator script. Until then, the spreadsheet exports are treated as import evidence only.

## Source Data

The current spreadsheet exports live in `packages/infra/data/`:

- `Azure Assets - Assets.csv` is the resource inventory.
- `Azure Assets - Reference.csv` is the naming convention and asset type reference.
- `Azure Assets - Regions.csv` maps display regions to Azure location names and short codes.

The assets export currently contains 51 resource rows plus the spreadsheet stop marker. It includes development and production resource groups, storage accounts, Function Apps, Web PubSub, Event Grid topics/subscriptions, Logic Apps, API connections, budgets, action groups, alert actions, Application Insights, Log Analytics, Cognitive Search, and Speech.

## Phase 1 Workflow

1. Install the Pulumi CLI and repository dependencies:

   ```powershell
   winget install Pulumi.Pulumi
   pulumi version
   pnpm install
   ```

2. Authenticate Azure locally:

   ```powershell
   az login
   az account set --subscription "<subscription-id>"
   ```

3. Create or select the Pulumi stack:

   ```powershell
   cd packages/infra
   pulumi stack init dev
   pulumi config set azure-native:subscriptionId "<subscription-id>"
   ```

   If the stack already exists:

   ```powershell
   pulumi stack select dev
   ```

4. Generate the import files from the CSV:

   ```powershell
   $env:AZURE_SUBSCRIPTION_ID = "<subscription-id>"
   pnpm inventory:build
   ```

5. Review `generated/azure-import-review.md`. Anything listed there needs a hand-filled Pulumi token, parent resource ID, or Azure-specific scope before import.

6. Import the ready resources:

   ```powershell
   pnpm import
   ```

7. Copy the resource code printed by Pulumi into `src/importedResources.ts`, import it from `src/main.ts`, then run:

   ```powershell
   pnpm preview
   ```

The target for phase 1 is a clean preview with no create, update, replace, or delete operations.

## Manual Review Items

The initial import generator can infer resource IDs for 39 resources. The remaining 12 resources need manual classification:

- Budgets may be subscription-scoped or resource-group-scoped. Confirm the exact Azure resource ID before importing.
- Event Grid subscriptions are children of a topic, domain, storage account, or another event source. The CSV name alone is not enough to infer the parent.
- Azure Monitor "actions" need classification. They may be metric alerts, scheduled query rules, processing rules, or another Insights resource.

## Cleanup Target

After the imported code is refactored into stable Pulumi components:

- Delete `packages/infra/data/`.
- Delete `packages/infra/generated/`.
- Delete `packages/infra/scripts/buildAzureImportManifest.ts`.
- Remove `pnpm inventory:build` from `packages/infra/package.json`.
- Remove `pnpm import` if imports are complete and the manifest no longer exists.
- Keep `src/main.ts` as the Pulumi entrypoint.
