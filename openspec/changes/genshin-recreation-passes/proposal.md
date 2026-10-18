# Recreation passes

## Why

The login scene has been worked by one loop that changes one thing, scores the whole frame and works the largest error, and the score does not converge: every unknown is judged through every other, so fixing one moves the rest. The interface converged because each of its parts is measured on its own. The passes order every part of a screen by dependency, gate each by its own measure and freeze it, so the work grows with the number of unknowns rather than their squares.

## What Changes

Every screen is rebuilt in dependency-ordered passes, each gated by its own measure, then frozen once it holds, and the login's bloom and cloud layer are finished under that order.

- A pass does not begin until every pass it depends on is within its gate, and a run that breaks this order is refused.
- A frozen pass's result is held by a test, and a later pass that finds it wrong reopens that pass rather than compensating for it.
- Scattered content such as clouds is matched by its cover, size and colour spread, never by a pixel score.
- The login scene draws bloom on pixels brighter than the game's threshold, and its brightest pixels are judged by a reading of their own.
- The login's cloud layer matches each hour's cover and size statistics.
- The frame's perceptual score is the acceptance once every gate holds, and a frame that stands off reopens the pass whose measure missed it.

## Capabilities

- **genshin/recreation-passes** (new)

## Waiting on

None.

## Impact

The parity tooling's pass runs and their gates, the login scene's look through its bloom and clouds, the engine's post pipeline that draws the bloom, and the compute queue's items for each pass.

Size kept as the source page's own: splitting it is a later decision.
