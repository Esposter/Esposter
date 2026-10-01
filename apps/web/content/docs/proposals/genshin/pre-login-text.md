---
title: Pre-login text
description: Proposal — the login screen's last English word, its welcome card's greeting, in every language the game ships, read off the installed client's own pre-login store with AnimeStudio and written into game text beside the text map's strings.
model: claude-opus-5-5
---

# Pre-login text

Built on [game text](/docs/genshin/game-text), which already serves the game's own words in fifteen languages by the id the game files them under. The opening reads every other word from it, the health notice, the login title, the door's prompt, the account label and the status lines under the progress bar among them, since the text map carries them even though they are on screen before the client has read its data. One does not appear in any text map: the welcome card's "Welcome,". No community dump carries the client-side store holding it, so `genshin-world` keeps it as the English client's word.

## How it would work

```mermaid
flowchart LR
  Closed{"Is the game closed?"} -- no --> Wait["Refused, as every AnimeStudio step is"]
  Closed -- yes --> Export["AnimeStudio export<br/>the pre-login store"]
  Export --> Find["Find each English string's id<br/>the welcome"]
  Find --> Keys["Pre-login keys beside GameTextKey"]
  Keys --> Write["genshin:text write reads both stores"]
  Write --> Chunks["Every language's chunk"]
  Chunks --> World["The login interface reads gameText"]
```

- **The store is read the way the derived assets are.** `runAnimeStudio` refuses while the game runs; the export lands under the parity directory with every other reference and is never committed.
- **The keys join the one inventory.** A pre-login string gets a `GameTextKey` member like any other, its value the store's own id, so a consumer cannot tell which store a string came from and the generator stays one command.
- **The words reach the interface the way the rest of its text does,** through the `gameText` prop the opening's host hands down.

## Scope

- The welcome card's greeting, in every language the client ships.
- Not the splash logos: they are images, and stay traced.

## Key files

| File                                                              | Role after the change                           |
| :---------------------------------------------------------------- | :---------------------------------------------- |
| `packages/genshin-world/src/services/login/constants.ts`          | Loses the welcome's English text                |
| `packages/genshin-world/src/components/Login/Interface/Index.vue` | Reads the welcome from the game text            |
| `packages/genshin-text/src/models/GameTextKey.ts`                 | Gains the pre-login strings                     |
| `scripts/src/services/genshinText/writeGameText.ts`               | Reads the pre-login store beside the text map   |
| `scripts/src/services/genshinAssets/runAnimeStudio.ts`            | Exports the store, refusing while the game runs |
