# When one resource points at another

Read when a resource file names another resource — setting `parent`, reading a `.name` or `.id`, or deciding
between a resource output and a named constant. The three always-on rules are in `SKILL.md`; this page is the
parent table, the constant thresholds, and what an `Output<string>` does in each position.

## The parent table

Every new resource sets the `parent` Pulumi option to the **nearest final Azure containment/extension parent**:

| Resource category                                                                                                                                                              | Correct `parent`                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Top-level RG-scoped resources (Logic Apps, API connections, Function Apps, App Service Plans, storage accounts, search services, Web PubSub, Event Grid topics, action groups) | Final resource group (`devRgEsposterAe001` / `prodRgEsposterAe001`) |
| Child/extension of storage account (blob service properties, management policies)                                                                                              | The storage account resource                                        |
| Child/extension of Event Grid topic (event subscriptions)                                                                                                                      | The Event Grid topic (once it has a final name)                     |
| Role assignments scoped to a specific managed resource (Logic App website contributor, EventGrid contributor)                                                                  | That scoped resource                                                |
| Subscription-scoped resources (budgets, policy assignments, subscription-level role assignments)                                                                               | No parent                                                           |

**Deferral rule:** if the natural parent is still a legacy resource scheduled for rename/deletion, defer setting
`parent` until the migration wave that creates the final parent. Create the child directly under the final parent in
that same wave — never under the legacy parent.

## An output, or a constant

- Prefer existing Pulumi resource outputs over repeated Azure identifier string literals when one managed resource
  refers to another. If Pulumi owns the resource, use its output properties (`.name`, `.id`, etc.) as source of truth
  instead of a separate constant.
- Add constants only for values external to managed resources, values required as plain strings in Pulumi
  options/import IDs, or shared built-in/static identifiers (e.g. role definition IDs).
- A local `const` within a file is fine when it is the **source of truth** for that name and reused more than once in
  the same file (e.g. `const workflowName = "dev-logic-esposter-ae-001"` used as the Pulumi resource name and the
  Azure property). Don't introduce a local const that merely duplicates a name owned by another resource file.
- **Single-use UUIDs inline directly** — don't declare `const roleAssignmentName = "uuid"` if used once; inline it:
  `roleAssignmentName: "uuid"`. Applies to any UUID/identifier appearing exactly once.
- **Named constants only for cross-file reuse** — create a constant file only when the value is referenced in ≥2
  resource files. A managed resource's principal id is never a constant: it is read from the resource's identity
  output through `getPrincipalId` in `src/azure/services`, so a recreated identity cannot leave a stale GUID behind.
  Only an external principal (the deployment service principal, a user) is a literal, and it lives in a named
  constant under the same ≥2-files rule.
- **Per-stack files, shared environment-independent values** — dev and prod each keep their own resource file (names,
  parents, scopes, action groups differ), but any value identical across stacks — KQL alert queries, tags, location,
  thresholds, repeated literal + explanatory comment pairs — is imported from one shared constant in
  `src/azure/constants/` rather than duplicated per stack.
- **A value the infra shares with app code interpolates the same constant that code uses** (e.g. an advanced-filter
  prefix comes from the constant the handler filters on), so renaming one cannot leave the infra filter and the code
  it mirrors silently disagreeing.
- **Mixing resource outputs and enum literals in one file is fine** — use a resource output (`.name`, `.id`) when
  Pulumi declares the referenced resource, and the plain enum/constant when it does not. The two forms sitting side
  by side in one `rules` array is correct, not an inconsistency; don't "fix" one to match the other.

## `Output<string>` in each position

`resource.name` and `resource.id` are `Output<string>`, not plain strings:

- **As a property value** — use dot notation directly; Pulumi accepts `Input<T>` (which includes `Output<T>`) for all
  properties: `connectionId: conn.id` ✓
- **In a template literal** — plain backtick interpolation silently produces `"[object Object]"`. Use
  ``pulumi.interpolate`prefix-${conn.name}-suffix` `` ✓
- **As a computed object key** — `[conn.name]` evaluates to `"[object Object]"` at runtime (JS calls `.toString()`
  eagerly).

**Preferred fix for object keys:** if the name is used as a key and also in template literals in the same file,
define `const connectionKey = "the-name"` as the local source of truth; use the Output (`.id`, `.name`) only for
property _values_ inside that keyed object. This avoids `pulumi.all().apply()` and stays readable.
`pulumi.all([conn.name]).apply(([name]) => ({ [name]: ... }))` is a valid last resort only when there is genuinely no
plain-string source of truth.
