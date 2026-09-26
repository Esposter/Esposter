# pnpm Bumps

Read when `packageManager` moves, at any size of bump.

pnpm ships its new workspace settings in minors — `autoDedupe` arrived in 12.6 — and a setting worth turning on shows up in the release notes and never in a green check. So a pnpm bump owes the **features half** of the major audit whatever its size: every release it crosses read from the tag (`gh release list -R pnpm/pnpm`, then `gh release view v<version> -R pnpm/pnpm`), each new setting weighed against `pnpm-workspace.yaml` and `renovate.json`, and the ones taken landing in the same commit as the `packageManager` bump, a declined one declined in its body. `renovate.json`'s `pnpm` rule turns off automerge so the bot's branch waits as a PR for that read, and `pnpm outdated:dependencies` lists `packageManager` as a row of its own. A setting that takes over something another tool was doing retires the other one in the same change — `autoDedupe` replaced the dedupe step Renovate used to run after each update.
