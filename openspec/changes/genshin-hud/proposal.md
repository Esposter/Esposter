# HUD

## Why

The HUD is built with its pieces and their looks, and every piece but the quest tracker stands in its fitted place. What is left is the re-measure of the composite, which shows how the HUD sits over a recording of the open world, and the quest tracker's place, which the game's interface tree has not yet given a rect.

## What Changes

Re-measure the HUD's composite against a recording that already shows the open world, and place the quest tracker once the game's interface tree gives it a rect.

- The HUD's composite is re-measured over a recording of the bare scene with the HUD hidden and shown; the re-measure reports its score and gates nothing.
- The quest tracker keeps its provisional place until the game's interface tree gives it a rect, then takes that rect.

## Capabilities

- **genshin/hud** (modified)

## Waiting on

- The game's interface tree gives the quest tracker a rect.

## Impact

The HUD drawn in the open world, in particular the quest tracker's place among the other pieces. The parity measurement tooling that scores the HUD against its recordings.

Size kept as the source page's own: splitting it is a later decision.
