## 1. Model levels

- [ ] 1.1 Carry the effort levels a model supports to the page with the model information. Verify: a test named after the scenario 'A model with effort support lists its levels' written first and seen failing.
- [ ] 1.2 Confirm against the recorded session that setting the effort level applies it to this session only. Verify: a test named after the scenario 'A chosen level applies to this session only' written first and seen failing.

## 2. Command and host

- [ ] 2.1 Add the command that sets a session's effort level, route it to the driver, and report the level back. Verify: a test named after the scenario 'A chosen level applies to this session only' written first and seen failing.
- [ ] 2.2 Keep the reported level on the page until the host reports a change. Verify: tests named after the scenarios 'The select keeps the reported level until the host reports the change' and 'A refused change never shows as made' written first and seen failing.

## 3. Composer

- [ ] 3.1 Add the effort select beside the model select, opened by its chord. Verify: tests named after the scenarios 'The chord opens the effort select' and 'The chord opens nothing for a model without effort support' written first and seen failing.
- [ ] 3.2 Hide the select for a model with no effort support, and follow a model switch. Verify: tests named after the scenarios 'A model without effort support shows no effort select' and 'A model switch that drops the current level shows the level reported next' written first and seen failing.
