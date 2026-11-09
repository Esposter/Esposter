# Tasks

## 1. The webpage's properties

- [ ] 1.1 Add the ten common properties to the property list and place each in the sector whose title it fits, with its field. Verify: tests named after the scenarios 'A property the sectors lacked is set in its sector' and 'The Effects sector sets a transform' written first and seen failing.
- [ ] 1.2 Refuse an unsupported value for a new property, leaving the field in error and the saved value unchanged. Verify: a test named after the scenario 'An unsupported value for a new property is not saved' written first and seen failing.

## 2. The email's sectors

- [ ] 2.1 Map each email attribute to a webpage sector title, with Other for a field no sector names, and draw the email's fields under those sectors. Verify: tests named after the scenarios 'A text's fields are grouped by sector' and 'A field no sector names is grouped under Other' written first and seen failing.
- [ ] 2.2 Draw no sector a node has no field for. Verify: a test named after the scenario 'A sector with no field for the node is not drawn' written first and seen failing.

## 3. The record

- [ ] 3.1 Update the style panel design's sector list and its Not built section, and the email page builder design's style fields. Verify: `pnpm exec openspec validate resource-page-builder-style-coverage --strict --no-interactive` passes.
