# Agent console retirement

## Why

The agent console's code, its host package, its specs and its follow-on ideas are removed from the repository, and the [rejected record](../../rejected/infra/agent-console/design.md) keeps why. What is left is outside the repository: the host package is still published on npm, and the host executable is still attached to earlier releases. A stranger can still run a host for a page that no longer exists.

## What Changes

- **BREAKING** The published agent-console-server package is unpublished from npm, every version, rather than deprecated.
- The host executable is deleted from the releases that carry it.

## Capabilities

None. This change removes published artifacts and adds no behaviour, so it carries no spec delta (`skip_specs`).

## Impact

- A command that used to run the host answers not found, and no notice points anywhere.
- The package name is held for a day after the last version goes and is then free to anyone.
- Releases from the removal onward carry no host executable, so only the earlier ones are touched.
