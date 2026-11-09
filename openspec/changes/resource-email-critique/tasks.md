# Tasks

## 1. The link and heading checks

- [ ] 1.1 Walk the email's buttons and navbar links and report each with no address or no text. Verify: tests named after the scenarios 'A button with no address is reported', 'A navbar link with no text is reported' and 'A button with an address and a label is not reported' written first and seen failing.
- [ ] 1.2 Walk the headings of the email's text blocks in document order and report each empty heading or one more than a level below the heading before it. Verify: tests named after the scenarios 'A heading two levels below the one before it is reported', 'A heading one level below the one before it is not reported' and 'An empty heading is reported' written first and seen failing.

## 2. The contrast check

- [ ] 2.1 Check each text against the nearest background its containers set, else the body's, else white, and report each below 4.5 to 1. Verify: tests named after the scenarios 'Low-contrast text is reported with its node', 'Text at exactly 4.5 to 1 is not reported' and 'Text is checked against its column background' written first and seen failing.
- [ ] 2.2 Report a text whose colour the editor cannot read, or whose colour a head default sets, as unchecked. Verify: a test named after the scenario 'A colour the editor cannot read is reported unchecked' written first and seen failing.

## 3. The problems surface

- [ ] 3.1 List the email's findings as warnings in the problems surface and rebuild them as the document is edited. Verify: tests named after the scenarios 'A link finding is a warning in the problems surface' and 'The findings follow an unsaved edit' written first and seen failing.
- [ ] 3.2 Keep a critique warning from refusing a save and select the node a chosen finding names. Verify: tests named after the scenarios 'A critique warning does not refuse an email save' and 'Choosing an email finding selects its node' written first and seen failing.

## 4. The agent read

- [ ] 4.1 Add the email to the critique map so the read tool answers its findings with colour checks unchecked. Verify: tests named after the scenarios 'An agent read reports a link finding of a saved email', 'An agent read reports email colour checks as unchecked' and 'A resource the key does not own is refused for an email' written first and seen failing.

## 5. The record

- [ ] 5.1 Update the critique design's Notes and key files to name the email's checks, and the email layout design's Not built section, which says contrast, links and alternative text are not checked over an email. Verify: `pnpm exec openspec validate resource-email-critique --strict --no-interactive` passes.
