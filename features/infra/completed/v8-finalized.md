# Infrastructure v8 Roadmap

Finalized low-risk naming wave.

## Scope

Redo the naming migration playbook from the beginning using the finalized naming rules in `packages/infra/docs/naming-conventions.md`.

This wave handles low-risk, replayable, or briefly parallel resources before moving into stateful service endpoint cutovers. It starts from the current clean baseline where the previous v8/v10 target resources are live and Pulumi-owned. Those resources are now treated as the legacy source for the finalized wave when their names still include outdated tokens.

## Finalized Naming Rules Used By This Wave

- Regional Azure resources keep the region token: `<environment>-<assetType>-<workload>-<region>-<index>`.
- Globally named Azure resources that allow hyphens omit the region token: `<environment>-<assetType>-<workload>-<index>`.
- Global compact resources that do not allow hyphens use: `<environment><assetType><workload><index>`.
- Legacy `shp`, single-letter environment tokens, `bdg`, `apicn`, `evgts`, and `pubsub` are not valid target tokens.
- Add Pulumi `parent` only when the actual parent resource is already target-named or is being migrated in the same wave.

## Candidate Resources

| Current Resource                    | Finalized Target Resource         | Notes                                                                                 |
| ----------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------- |
| `dev-ag-esposter-auea-001..003`     | `dev-ag-esposter-001..003`        | Global resource; create target action groups first, then update budget/alert refs.    |
| `prod-ag-esposter-auea-001..003`    | `prod-ag-esposter-001..003`       | Same as dev; refresh Logic App callback URLs only if receiver workflow IDs change.    |
| `d-shp-bdg-esposter-auea-001..002`  | `dev-bgt-esposter-001..002`       | Global-ish resource-group budget name; use finalized `bgt` token and no region token. |
| `p-shp-bdg-esposter-auea-001..002`  | `prod-bgt-esposter-001..002`      | Same as dev; keep scope and thresholds identical.                                     |
| `dev-apic-esposter-auea-001..004`   | `dev-apic-esposter-ae-001..004`   | Regional resource; replace after target action groups are live.                       |
| `prod-apic-esposter-auea-001..004`  | `prod-apic-esposter-ae-001..004`  | Regional resource; same pattern as dev.                                               |
| `dev-logic-esposter-auea-001..004`  | `dev-logic-esposter-ae-001..004`  | Regional resource; recreate after target API connections exist. Parent deferred.      |
| `prod-logic-esposter-auea-001..004` | `prod-logic-esposter-ae-001..004` | Regional resource; same pattern as dev. Parent deferred.                              |
| `dev-evgs-esposter-auea-001..002`   | `dev-evgs-esposter-ae-001..002`   | Scoped to regional topic; recreate after target Logic Apps/roles are live.            |
| `prod-evgs-esposter-auea-001..002`  | `prod-evgs-esposter-ae-001..002`  | Scoped to regional topic; same pattern as dev.                                        |

## Work Items

- [x] Add finalized target action group files.
- [x] Update Smart Detector rules and budgets to reference finalized action groups.
- [x] Add finalized target budget files with identical scope, thresholds, filters, and notifications.
- [x] Run preview and confirm action-group create scope.
- [x] Apply finalized action-group create step.
- [x] Verify finalized action groups exist in Azure.
- [x] Run post-apply preview before any further applies.
- [x] Run preview and confirm budget/reference cutover scope.
- [x] Apply budget/reference cutover step.
- [x] Verify finalized action group receivers and budget notifications.
- [x] Run post-budget-cutover preview before cleanup.
- [x] Unprotect old action group and budget state only for the cleanup step.
- [x] Remove old action group and budget source files in a cleanup step after verification.
- [x] Run final clean preview.

## Top-Down Parent Wave (Correction)

The migration was restarted top-down so final Azure names and final Pulumi parents land together.

- [x] Remove accidental `dev/prod-apic-esposter-ae-001..004` API connections created in legacy resource groups.
- [x] Create final resource groups: `dev-rg-esposter-ae-001` and `prod-rg-esposter-ae-001`.
- [x] Recreate action groups in the final resource groups with final names and `parent` set to the final resource group.
- [x] Recreate budgets with final names (scope still points to legacy RGs until filtered resources are migrated).
- [x] Recreate API connections in the final resource groups with final names and `parent` set to the final resource group.
- [x] Recreate Logic Apps in the final resource groups with final names and `parent` set to the final resource group.
- [x] Create role assignments for new Logic App managed identities.
- [x] Cut action-group references to final resource-group action groups.
- [x] Recreate Event Grid subscriptions (`dev/prod-evgs-esposter-ae-001..002`) referencing new Logic Apps and roles.
- [x] Clean up old Logic Apps, API connections, auea event subscriptions, and action groups after scoped previews.
- [x] Final preview clean at `96 unchanged`.

## Pulumi Notes

- Budgets should move to final resource-group scope strings (`subscriptions/.../resourceGroups/dev-rg-esposter-ae-001` and `subscriptions/.../resourceGroups/prod-rg-esposter-ae-001`) only when their filtered resources also have final names.
- API connections require live `parameterValueType: "Alternative"` verification after creation because the Azure Native schema does not model it. Use a full `PUT` with `parameterValueType: "Alternative"` and `alternativeParameterValues: {}`; `PATCH` is rejected by Azure for API connection properties.
- Keep callback URL values in Pulumi config secrets. Do not commit callback URLs or generated Logic App export payloads.
- Do not delete old budget/action group resources in the same apply that creates the target resources and swaps references.
- Action group Pulumi logical names must NOT include the parent resource group name as a suffix. The `parent` option handles the URN hierarchy independently.
- `pulumi state delete --force --target-dependents` is required when cascading state removal from protected resources that have dependents. After removal, use `pulumi import --parent <urn>` for each resource to re-register under the correct parent-scoped URN.

## Rollback

- Point budgets and Smart Detector rules back to the previous action groups.
- Keep old action groups and budgets protected until finalized resources are verified.
- If target budget creation fails, leave old budgets in place and remove the target files before retrying.
