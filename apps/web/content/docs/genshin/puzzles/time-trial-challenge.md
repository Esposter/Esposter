---
title: Time Trial Challenge
description: A Time Trial Challenge as a timed state machine, solved by striking every target before its clock runs out. Built in the world package; not yet placed or started in the world.
---

# Time Trial Challenge

A `TimeTrialChallenge` holds its clock's limit and what is left of it, its state, and how many of its targets are struck against how many it asks for. `startTimeTrialChallenge` starts an idle one from its marker, `strikeTimeTrialTarget` counts a target done and solves the challenge once the last is, and `stepTimeTrialChallenge` runs the clock on the fixed step and fails it when it runs out. A solved challenge is the solve event: once challenges are placed, the world will read its `Solved` state and spawn its chest, which the chests opening will grant. The map gives no limit or target count per challenge, so both come from the world's data once measured.

## Key files

| File                                                                    | Role                                                                    |
| :---------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| `packages/genshin-world/src/models/puzzle/TimeTrialChallenge.ts`        | A challenge's clock, targets and state                                  |
| `packages/genshin-world/src/services/puzzle/startTimeTrialChallenge.ts` | Starts an idle challenge's clock from its marker                        |
| `packages/genshin-world/src/services/puzzle/strikeTimeTrialTarget.ts`   | Counts a target done, solving the challenge on its last                 |
| `packages/genshin-world/src/services/puzzle/stepTimeTrialChallenge.ts`  | Runs a challenge's clock on the fixed step, failing it when it runs out |
