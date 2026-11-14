# When one resource points at another

Read when a resource file names another resource — setting `parent`, reading a `.name` or `.id`, or deciding
between a resource output and a named constant. The three always-on rules are in `SKILL.md`; this page is the
parent table, the constant thresholds, and what an `Output<string>` does in each position.

## The parent table

Every resource whose containing resource is declared sets the `parent` Pulumi option to it:

| Resource category                                      | Correct `parent`                              |
| ------------------------------------------------------ | --------------------------------------------- |
| Queue consumer (`prodQEsposterProcessWebhookConsumer`) | Its queue (`prodQEsposterProcessWebhook`)     |
| R2 bucket lifecycle and R2 bucket event notification   | Its R2 bucket (`prodR2EsposterMessageAssets`) |
| Zone DNS record, zone ruleset, Workers custom domain   | The zone (`esposterCom`)                      |
| Queue, dead-letter queue, D1 database, R2 bucket, zone | No parent — account-scoped                    |

**Deferral rule:** if the natural parent is still scheduled for rename or deletion, the child waits for the wave that creates the final parent. It is created under the final parent in that same wave, never under the parent being removed.

## An output, or a constant

- Prefer existing Pulumi resource outputs over repeated identifier string literals when one managed resource
  refers to another. If Pulumi owns the resource, use its output properties (`.name`, `.id`, etc.) as source of truth
  instead of a separate constant.
- Add constants only for values external to managed resources, values required as plain strings in Pulumi
  options/import IDs, or shared static identifiers. The account id is the example of the first: it is read from configuration, not created by the program.
- A local `const` within a file is fine when it is the **source of truth** for that name and reused more than once in
  the same file. `prodR2EsposterMessageAssets.ts` builds `bucketName` once with `getCloudflareResourceName` and uses it as the Pulumi resource name and the bucket's `name`. Don't introduce a local const that merely duplicates a name owned by another resource file.
- **Named constants only for cross-file reuse** — create a constant file only when the value is referenced in ≥2
  resource files. `CloudflareAccountId` is the pattern: every resource file reads it from `src/cloudflare/constants/`.
- **Per-stack files, shared environment-independent values** — dev and prod each keep their own resource file (names,
  parents and protection are per-environment), but any value identical across stacks — the account id, the location hint, a queue consumer's retry delay — is imported from one shared constant in `src/cloudflare/constants/` rather than duplicated per stack.
- **A value the infra shares with app code interpolates the same constant that code uses.** A queue's name is built by `getCloudflareResourceName`, the same function the functions Worker's batch handler uses to name the queue it consumes, so renaming one cannot leave the infra and the code it feeds silently disagreeing.
- **Mixing resource outputs and enum literals in one file is fine** — use a resource output (`.name`, `.id`) when
  Pulumi declares the referenced resource, and the plain enum/constant when it does not. The two forms sitting side
  by side in one `rules` array is correct, not an inconsistency; don't "fix" one to match the other.

## `Output<string>` in each position

`resource.name` and `resource.id` are `Output<string>`, not plain strings:

- **As a property value** — use dot notation directly; Pulumi accepts `Input<T>` (which includes `Output<T>`) for all
  properties: `queueId: prodQEsposterProcessWebhook.queueId` ✓
- **In a template literal** — plain backtick interpolation silently produces `"[object Object]"`. Use
  ``pulumi.interpolate`prefix-${conn.name}-suffix` `` ✓
- **As a computed object key** — `[conn.name]` evaluates to `"[object Object]"` at runtime (JS calls `.toString()`
  eagerly).

**Preferred fix for object keys:** if the name is used as a key and also in template literals in the same file,
define `const connectionKey = "the-name"` as the local source of truth; use the Output (`.id`, `.name`) only for
property _values_ inside that keyed object. This avoids `pulumi.all().apply()` and stays readable.
`pulumi.all([conn.name]).apply(([name]) => ({ [name]: ... }))` is a valid last resort only when there is genuinely no
plain-string source of truth.
