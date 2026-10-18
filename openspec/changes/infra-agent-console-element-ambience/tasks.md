## 1. Loudness envelope

- [ ] 1.1 Measure each spoken clip's loudness in short frames from the samples already held, and send the envelope with its line before playback. Verify: a test named after the scenario 'Muted volume still moves the field' written first and seen failing.
- [ ] 1.2 Carry the clip's duration with the envelope, so the page starts the field on arrival. Verify: a test named after the scenario 'A slow page runs behind the voice, never ahead of it' written first and seen failing.

## 2. Field presets

- [ ] 2.1 Draw each element's field from its preset, with intensity following the envelope. Verify: a test named after the scenario 'A louder line swells the field' written first and seen failing.
- [ ] 2.2 Choose the preset from the session character's element, Hydro's calm state reusing the fluid simulator as it stands. Verify: tests named after the scenarios 'The character's element chooses the field' and 'A fire character gets the embers field' written first and seen failing.
- [ ] 2.3 Settle the field when the line ends. Verify: a test named after the scenario 'The field settles when the line ends' written first and seen failing.

## 3. Quiet state

- [ ] 3.1 Idle the field at its lowest rate with no line playing. Verify: a test named after the scenario 'No line playing idles the field' written first and seen failing.
- [ ] 3.2 Stop drawing while the page is hidden. Verify: a test named after the scenario 'A hidden page draws nothing' written first and seen failing.
