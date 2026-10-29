# Running preview and up

Read when running `pnpm infra:preview` / `pnpm infra:up`, after a catalog bump to a `@pulumi/*` provider package, or when a resource reads as deployed but demonstrably does not work.

## Verification order

Run in order from `apps/infra/`, always before `infra:preview` or `infra:up`:

1. `pnpm typecheck` — TypeScript type check, the one check a session runs ahead of CI (the `running-checks` skill, "A Pulumi apply").
2. `pnpm infra:preview --suppress-outputs` — confirm scope before applying.
3. `pnpm infra:up --yes --suppress-outputs` — apply once the preview shows only the intended changes.

`infra:preview` and `infra:up` both run `pnpm build` themselves — never run `pnpm build` separately first.

On the Windows PC the Pulumi binaries sit directly in `C:\Program Files (x86)\Pulumi`, with no `bin` folder, and Git Bash's PATH does not reach them. Put that folder first for the command — `PATH="/c/Program Files (x86)/Pulumi:$PATH" pnpm infra:preview` — and never install a second copy.

## Rules around an apply

- Never use `pulumi up --skip-preview`.
- **`pnpm infra:up` is always allowed** once the preview shows only the intended changes. The session runs the preview, reads the changes it would apply, and applies them; an apply changes live Azure resources, so the preview is the check that comes before it.
- Before applying, confirm the preview contains only the intended resources and properties for the active roadmap item.
- If `pulumi up` partially succeeds or fails, stop and run `pnpm infra:preview` again before any follow-up apply.
- **`preview` and `up` diff the program against state, never against Azure**, so an `up` reporting `unchanged` is not evidence that the live estate matches — anything changed out of band is invisible to both. When something reads as deployed but does not work, run `pnpm infra:refresh` before concluding the code is wrong, and check RBAC against Azure directly (`az role assignment list --assignee <principalId> --all`): a role assignment present in state and absent in Azure fails at runtime with `Forbidden` behind a clean preview.

## An update to a resource with an identity previews as replacing every grant on it

A role assignment reads its `principalId` through `getPrincipalId`, an `apply` over the resource's `identity`
output. When the program updates that resource — a Logic App's `definition`, say — the provider cannot promise
the identity survives, so the preview carries it as `[unknown]`, and an unknown `principalId` on a `protect: true`
grant is `+-… to replace … marked for protection`: the preview fails on every assignment the identity holds,
while the only real diff is the property being edited. The GUID does not
change on an update, and an `up` resolves it to the same value, but the failed preview blocks the plain `up`.

Apply it targeted: `pnpm infra:up --yes --suppress-outputs --target '**::<resource-name>'`, one `--target` per
edited resource. The wildcard form is the one to use — a full URN carries `$` segments the `pnpm` script layer
re-expands even inside single quotes, and the target then "could not be found in the stack". A following
untargeted `infra:preview` reports the grants unchanged, because the identity is no longer in motion.

## The first `up` after a provider bump cannot be targeted

State pins the default provider each resource was last written with (`pulumi:providers:github::default_<version>`), so a catalog bump to a provider package makes the program register a version state has never seen. Under `--target`, Pulumi registers providers only for the targeted resources, so the untargeted ones' provider is missing and it refuses:

```text
error: provider …:pulumi:providers:github::default_6_14_0::… for resource …
has not been registered yet, this is due to a change of providers mixed with --target
```

This is not drift to repair and no CLI upgrade fixes it. Run the update **untargeted** — plain `pnpm infra:up`, or `pulumi up --exclude <urn>` when specific resources must be held back, since `--exclude` still registers every provider. That run re-associates the resources onto the new provider, and `--target` works again until the next bump. `--exclude` accepts wildcards, so `--exclude "**::<resource-name>"` holds back one resource by name.

Hold a resource back when its Azure-side create depends on something not yet deployed — an Event Grid subscription is validated against its function endpoint at create time, so a subscription for a function that only exists in an unreleased build fails until that release lands (`openspec/specs/infra/eventgrid-dead-letter/design.md`).
