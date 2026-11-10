## Why

A driven-browser check of a signed-in page cannot run today. The app's tRPC procedures read the session cookie and refuse a request without one, sign-in goes only through third-party providers, and the dev database holds no seed. So the messages, friends, drafts, resources and achievements pages cannot be opened in a real browser as a signed-in person, and a UI change to them ships with a claim nobody has watched.

## What Changes

- A dev-only session route signs one seeded user in. A development server registers it, a production build does not, and it refuses every request unless the server is not in production, the database it reads is on the local machine and the seed has written that user.
- A seed writes a dev dataset (users, friendships, rooms, roles, resources and messages) to a database and a storage emulator of its own, and stops before any write when pointed at the owner's dev database or the default emulator.
- The driven-browser reference gains the driver step that starts the server and the emulator for a run and signs the browser in, replacing its statement that nothing is signed in.
- The rejected Playwright option in the genshin-phases design is amended. Its sign-in reason no longer holds, and its Azure reason stands.

## Capabilities

### New Capabilities

- `architecture/driven-session`: the dev-only session route, its gates, and the seed that a driven browser reads.

### Modified Capabilities

None. Production sign-in is unchanged. The auth capability's provider-only requirement still holds for every build a person reaches, and the one dev-only exception is recorded in this change's design.

## Impact

Dev tooling only. No production route, table, schema or service changes, and no change to the owner's dev database or the owner's storage emulator data.
