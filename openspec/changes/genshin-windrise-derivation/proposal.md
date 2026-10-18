# Windrise Derivation

## Why

The scene derivation's layout pass and Windrise's stand-ins are built, but not every object the game streams in Windrise is placed: the dais and the pedestals are missing. The stand-ins are not ranked against their game objects, so the rebuild order is arbitrary, and the light and haze are not fitted over the rebuilt objects. Two passes remain before the open world matches the game's own data.

## What Changes

Windrise's open world stands on every object the game streams, each judged against its game counterpart in a fixed order.

- Every object the game streams in Windrise stands at its exact place and turn, the dais and the pedestals included.
- Each stand-in is scored against its game object, and the lowest-scoring are rebuilt first, judged by the same gate as the rest of the frame.
- Each hour's light and haze are calibrated after the objects they fall on are rebuilt, so they match the game at that hour.

## Capabilities

- **genshin/windrise-derivation** (new)

## Waiting on

- Game data: `game-exports` (as the change needs).

## Impact

The component map that names each component's roots, spawns and landmarks gains Windrise's streamed objects, and the fit map gives each component its fit. The parity loss table orders the stand-ins for rebuild. The login scene comes first among the scenes run through this method.
