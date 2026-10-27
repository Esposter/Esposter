# Tasks

Each task names the test it writes first, where a unit test earns its line. The network call and the evidence log run in the plugin's node script; the module holds the pure logic and the hooks. A render hook takes the engine's `$`, so its wiring is checked by `claude plugin validate` and by the manual check in task 8, not by a unit test.

## 1. Scoring math

- [x] `getPosteriorTrail.ts` and `getScoreAndSpread.ts`. Tests: one prompt at 0.8 from the flat prior gives 60%; a change from 0.9 to 0.1 sits at about 50% after thirty prompts; the trail's last entry equals the replay, and a sin with no evidence reads as the flat prior.
- [x] `getTrend.ts`. Tests: the trend keeps the last thirty scores; the glyphs run from the lowest to the tallest.

## 2. Evidence

- [x] `getEvidence.ts`. No test of its own: the mapping is one division and a clamp, and `appendSinEvidence`'s test pins the stored value, which is the score over the top level.

## 3. The drawn copy

- [x] `appendSinEvidence.ts`. Tests: each sin appends its evidence in the answer's own scale; the history keeps only its newest length.
- [x] `getSinScores.ts`. Tests: a sin with no evidence is left out; nothing is drawn before the first scored prompt.

## 4. The bars

- [x] `getBarCells.ts`. Tests: a score of 62% with a spread of 9 at width 20 gives 12 solid and 2 tinted cells; a score of none draws no solid cells.

## 5. The node script

- [x] `sinsScript.ts`, run through the real `node` against a local HTTP stub. Tests: no key makes no request and returns `no-key`; a successful call records the seven answers in the evidence log; a failing call returns `failed` with its HTTP status.
- [x] The script sets a busy timeout on every open, found by the review: a second writer fails with "database is locked" without it. Checked by a two-process probe, not a unit test, since the lock is the database's own behaviour.

## 6. Switch, hook, pane and band

- [x] The switch in `types/index.d.ts`, `InitialState.ts` (default off), and the `sins` entry in `ModDescriptionMap.ts`; the lifecycle's existing command loop makes `/sins`.
- [x] The prompt hook in `registerLifecycle.ts`: redacts with `veilText`, passes the prompt on, and schedules the scoring beside the turn. Redaction is veil's own tested function, not a copy.
- [x] `registerSins.ts`: the pane's `ui.render`, the palette read from the theme row, and the pane's off state. No unit test: a render hook takes the engine's `$`.
- [x] `registerBand.ts`: the summary line and the `p` button that opens the pane.
- [x] `registerLifecycle.ts`: `clear` and `resume` reset the history and the session.
- [x] `readHome.ts`, shared by the sins scoring and the ward mod's records path, found by the review as a duplicated lookup.

## 7. Calibration and cost

- [ ] Measured in the scratchpad, not committed. Score about fifty of the owner's own prompts, redacted, and compare Jev's expected levels with the owner's labels. Record the tokens per call and the real bill beside the secondary figures. The result goes into the design's Notes, and decides whether a recalibration is needed. Needs the owner's key and labels.

## 8. Ship

- [ ] Manual verification: the owner checks the band line and the pane in a live terminal session. Owner's eyes, not a browser.
- [x] `packages/genshin-mods/README.md`: the command row.
- [ ] `packages/genshin-mods/README.md` Decisions and the shipped genshin-mods spec's README: the bullet rewritten to name the sins mod as the exception, with the old direction named as rejected. Done at archive, with the shipped spec.
- [ ] The typed-decisions design's Notes: the sins script named as a second consumer of Jev. Done at archive.
- [ ] Archive the change, sweep references, and log the shipped line in the genshin-mods index.
