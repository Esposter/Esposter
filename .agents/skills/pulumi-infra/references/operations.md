# Running preview and up

Read when running `pnpm infra:preview` / `pnpm infra:up`, after a catalog bump to a `@pulumi/*` provider package, or when a resource reads as deployed but demonstrably does not work.

## Verification order

Run in order from `apps/infra/`, always before `infra:preview` or `infra:up`:

1. `pnpm typecheck` — TypeScript type check, the one check a session runs ahead of CI (the `running-checks` skill, "A Pulumi apply").
2. `pnpm infra:preview --suppress-outputs` — confirm scope before applying.
3. `pnpm infra:up --yes --suppress-outputs` — apply once the preview shows only the intended changes.

`infra:preview` and `infra:up` both run `pnpm build` themselves — never run `pnpm build` separately first.

On the Windows PC the Pulumi binaries sit directly in the Pulumi install folder, with no `bin` folder, and Git Bash's PATH does not reach them. Put that folder first for the command — `PATH="/c/Program Files (x86)/Pulumi:$PATH" pnpm infra:preview` — and never install a second copy.

## Rules around an apply

- Never use `pulumi up --skip-preview`.
- **`pnpm infra:up` is always allowed** once the preview shows only the intended changes. The session runs the preview, reads the changes it would apply, and applies them; an apply changes live Cloudflare resources, so the preview is the check that comes before it.
- Before applying, confirm the preview contains only the intended resources and properties for the active roadmap item.
- If `pulumi up` partially succeeds or fails, stop and run `pnpm infra:preview` again before any follow-up apply.
- **`preview` and `up` diff the program against state, never against the live account**, so an `up` reporting `unchanged` is not evidence that the account matches — a change made out of band is invisible to both. A resource deleted out of band stays in state until a refresh, so a preview that reads only state is clean over it. When something reads as deployed but does not work, run `pnpm infra:refresh` before concluding the code is wrong, and read the live resource in the Cloudflare dashboard or through `wrangler` before trusting either.
- **A resource deleted out of band is refreshed alone, then applied alone.** `pnpm infra:refresh --preview-only --suppress-outputs --target '**::<resource-name>'` shows it dropping from state, the same command with `--yes` drops it, and `pnpm infra:preview` then `infra:up` with the same `--target` recreates it. An untargeted refresh folds every other drift into state, and an untargeted `up` applies whatever else is pending, which may not be the change in hand. A manual change made in the dashboard leaves the account holding what the code does not declare, so it is reverted once the declared resource is back.

## Targeting an apply

Name each resource with `--target '**::<resource-name>'`, one `--target` per resource. The wildcard form is the one to use: a full URN carries `$` segments the `pnpm` script layer re-expands even inside single quotes, and the target then "could not be found in the stack".

## The first `up` after a provider bump cannot be targeted

State pins the default provider each resource was last written with (`pulumi:providers:github::default_<version>`), so a catalog bump to a provider package makes the program register a version state has never seen. Under `--target`, Pulumi registers providers only for the targeted resources, so the untargeted ones' provider is missing and it refuses:

```text
error: provider …:pulumi:providers:github::default_6_14_0::… for resource …
has not been registered yet, this is due to a change of providers mixed with --target
```

This is not drift to repair and no CLI upgrade fixes it. Run the update **untargeted** — plain `pnpm infra:up`, or `pulumi up --exclude <urn>` when specific resources must be held back, since `--exclude` still registers every provider. That run re-associates the resources onto the new provider, and `--target` works again until the next bump. `--exclude` accepts wildcards, so `--exclude "**::<resource-name>"` holds back one resource by name.

Hold a resource back when its create depends on a Worker that is not deployed yet: a queue consumer names its Worker's script and a Workers custom domain names its Worker, so both wait for the Worker's first deploy (`apps/infra/docs/stacks.md`, "First deploy").
