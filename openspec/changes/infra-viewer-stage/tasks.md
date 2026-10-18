## 1. Probes on the reader's install

- [ ] 1.1 Probe whether the model lip-syncs from a sound sent over the socket, and whether a WAV path is accepted. If the path form needs a compressed clip, the sound stays on the stock player and the viewer shows the bubble alone. Verify: one sound message sent on the reader's install is answered by the viewer, and the reader sees the result. Left open: needs a Live2DViewerEX run with a model loaded on the reader's Windows install, which this build cannot reach. The sound-on-the-stock-player fallback for a compressed-only path is built behind `VIEWER_SOUND_FORM`, and the probe still decides which path runs by setting that constant.
- [ ] 1.2 Probe whether a tap on a hit area reaches the synthesizer. Verify: a tap on the model is received, and a test named after the scenario 'A tap replays the last line' written first and seen failing. Left open: needs the same install run as 1.1. The tap replay is built and tested against a fake link (task 2.4); the probe confirms the viewer's tap reaches the socket.

## 2. Viewer sink

- [x] 2.1 Show each spoken line as a bubble and a sound on the model, paced by the clip's length. Verify: tests named after the scenarios 'A spoken line appears on the model' and 'The next line waits for the clip's own length' written first and seen failing.
- [x] 2.2 Fall back to the stock player when no viewer listens or the viewer drops. Verify: tests named after the scenarios 'No viewer listening falls back to the stock player' and 'A viewer dropping mid-reply moves the rest to the player' written first and seen failing.
- [x] 2.3 Stop the sound and clear the bubble when a newer turn arrives. Verify: a test named after the scenario 'A newer turn clears the bubble' written first and seen failing.
- [x] 2.4 Replay the last line on a tap, sending no turn to the session, and keep only the last clip on disk. Verify: tests named after the scenarios 'A tap replays the last line' and 'A tap sends no turn to the session' written first and seen failing.

## 3. Reactions

- [x] 3.1 Send the mapped motion on attention wanted and clear the expression at the end of a turn, behind the same file check. Verify: tests named after the scenarios 'Attention wanted turns the character' and 'An unmapped moment sends no motion to the viewer' written first and seen failing.

## 4. The verb and no-viewer machines

- [x] 4.1 Add the viewer verb that writes the address and the motion map, proves the connection, and extend teardown to remove them. Verify: tests named after the scenarios 'The viewer verb proves the connection with one bubble', 'The viewer verb reports a viewer that did not answer' and 'Teardown removes the viewer setup' written first and seen failing.
- [x] 4.2 Leave a machine with no viewer exactly as it is today. Verify: a test named after the scenario 'A machine with no viewer is unchanged' written first and seen failing.

## 5. Absent motion shape

- [ ] 5.1 Store an unmapped moment as `""` rather than deleting its key with `undefined`, so the motion map is a full record of the two moments and reads by truthiness. The reader's defaults, the verb's empty map, `getViewerReaction`'s return type and the stored file format change in the same commit, and `ViewerConfiguration.ts`'s `Partial<Record<…>>` shape goes with them. Verify: a test named after the scenario this adds to the spec delta, written first and seen failing, with the stored file of the previous shape read and rewritten.
