# Agent console retirement

## Why

The agent console's code, its host package, its specs and its follow-on ideas are removed from the repository, and the [rejected record](../../rejected/infra/agent-console/design.md) keeps why. What was left was outside the repository: the host package was still published on npm, and the host executable was still attached to earlier releases. A stranger could still run a host for a page that no longer exists.

## What Changes

- **BREAKING** The published agent-console-server package is unpublished from npm, every version, rather than deprecated.
- The host executable stays attached to the releases that carry it. GitHub's immutable releases refuse the deletion of an asset, and deleting a whole release to drop one file would lose its notes and its page.

## Capabilities

None. This change removes a published artifact and adds no behaviour, so it carries no spec delta (`skip_specs`).

## Impact

- A command that used to run the host answers not found, and no notice points anywhere.
- The package name is held for a day after the last version goes and is then free to anyone.
- Releases from the removal onward carry no host executable; the earlier ones keep theirs.
