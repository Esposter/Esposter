# Revisiting an `@TODO`

Read when bumping a package an `@TODO` links, or when a linked upstream issue may have closed.

- **Every bump of the package the link names.** The release notes are read against every marker linking it (`git grep -n "@TODO: <repository url>"`), and a workaround the new version makes redundant is removed in the bump's own commit — the `dependency-updates` skill's features read (`references/major-upgrades.md`, "Read the features list") is where a major does this, and a minor that closes the issue owes the same.
- **Whenever the linked issue closes.** `gh issue view <url> --json state` answers it. Closed and released in the version the catalog resolves (`pnpm-workspace.yaml`, then `pnpm-lock.yaml`): remove the workaround and the marker, and run the touched tests. Closed but not yet released in that version: it stays, and nothing changes until the bump that takes the fix.
