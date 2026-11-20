# grid-engine-headless

[![Apache-2.0 licensed][badge-license]][url-license]
[![NPM version][badge-npm-version]][url-npm]
[![NPM downloads][badge-npm-downloads]][url-npm]
[![NPM Unpacked Size (with version)][badge-npm-unpacked-size]][url-npm]

A headless grid movement engine: tile collision, characters on integer tiles that step in four directions, and five typed events, with no rendering and no Phaser.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- 🚀 [Getting Started](#getting-started)
- 🧩 [Key Exports](#key-exports)
- ⚖️ [License](#license)

---

## <a name="getting-started">🚀 Getting Started</a>

1. Install the package.

```bash
pnpm i grid-engine-headless
```

2. Make an engine and walk a character one tile. A call that can fail returns a result, read here with `match`.

```ts
import { createGridEngine, Direction } from "grid-engine-headless";

const engine = createGridEngine({ characters: [{ id: "player" }], tiles: [[false, false]] }).match(
  (created) => created,
  (error) => {
    throw error;
  },
);

engine.on("positionChangeFinished", ({ enterTile, id }) => {
  console.log(id, "stands on", enterTile);
});

engine.move("player", Direction.Right).match(
  () => {
    engine.update(250);
  },
  (error) => {
    throw error;
  },
);
```

Time is passed by `update`, in milliseconds, and the default speed is four tiles a second.

## <a name="key-exports">🧩 Key Exports</a>

| Export                | Kind      | Purpose                                                                                                                                 |
| --------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `CharacterConfig`     | interface | A character's starting id, position, facing and speed; each absent field takes its default                                              |
| `createGridEngine`    | function  | Makes an engine from a grid of tiles and the characters it starts with, or returns the error that refuses them                          |
| `Direction`           | value set | The nine directions: four steps, the four diagonals a character may face, and none                                                      |
| `GridEngine`          | interface | The engine: adds and moves characters, turns and teleports them, answers collision queries, subscribes to events and steps time forward |
| `GridEngineConfig`    | interface | The grid of tiles, where a tile is blocking, open or absent, and the characters an engine starts with                                   |
| `GridEngineError`     | interface | The error a call returns, with the character or the position it was about                                                               |
| `GridEngineErrorKind` | value set | Why a call failed: an unknown character, a position outside the grid, a diagonal move, an invalid grid or an invalid speed              |
| `GridEngineEvents`    | interface | The payloads of the five events: a direction changed, a movement started or stopped, and a position change started or finished          |
| `Position`            | interface | A tile by its column and row, counted from the top left corner                                                                          |

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
[badge-npm-version]: https://img.shields.io/npm/v/grid-engine-headless/latest?color=brightgreen
[url-npm]: https://www.npmjs.com/package/grid-engine-headless/v/latest
[badge-npm-unpacked-size]: https://img.shields.io/npm/unpacked-size/grid-engine-headless/latest?label=npm
[badge-npm-downloads]: https://img.shields.io/npm/dm/grid-engine-headless.svg
