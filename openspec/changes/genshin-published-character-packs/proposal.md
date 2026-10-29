# Published character packs

## Why

The official model packs are published to the public game data container (13 characters, 136 files, about 85 MB), yet the world still draws every character as a capsule unless the player loaded a pack of their own or a development server answered, and no production build serves the second. A capsule is a stand-in the game never shows, three delivery routes (the development server, a signed-in account's kept packs and a pack loaded from a zip into the browser) exist only to work around a rule the owner has since lifted, and the startup loading screen moves in thirds that say nothing about what is being fetched.

## What Changes

The world reads the published packs and the loading screen downloads them.

- **BREAKING** The capsule that stands for a character with no model is removed. The player's character is always drawn from its published pack.
- The packs are listed by one hosted index record, which gives each avatar's files with their bytes and hashes.
- The opening starts downloading every published pack when it mounts, keeps each file in the browser, and the startup loading screen shows the download's progress by bytes and the size that remains, in the game's own words.
- A download that fails after its retries stops the loading with the game's failure line and a retry.
- **BREAKING** The three delivery routes and everything that served only them are removed: the development server's route, the account's kept packs (their procedures, API route, composable and blob helpers) and the browser's kept packs (the loader, the zip and folder readers, the stores).

## Capabilities

- **genshin/characters/published-packs** (modified)
- **genshin/characters/drawing** (modified)
- **genshin/characters/player-packs** (removed)

## Waiting on

- Nothing. The packs are published and the game text for downloading is in the dump.

## Impact

- The Genshin world's player character, the startup loading screen and the host's progress.
- The Character screen's terms view, which reads the published pack's terms instead of a pack the player loaded.
- The server's Genshin character pack routes, the account blob helpers and the account deletion that cleaned the account's kept packs.
- The specs of account deletion, storage quotas, blob lifecycle, user data inventory and IndexedDB that name the removed routes.
- Enemies, wildlife and the other capsules in the world are not characters and stay as they are until their models exist.
