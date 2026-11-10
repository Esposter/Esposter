# Tasks

## 1. The shared footer submit

- [ ] 1.1 Decide the route with the owner: compose the form shell, or take a footer-submit binding on the base dialog. Verify: the chosen route is written into design.md's Decisions, replacing the open choice.
- [ ] 1.2 Move the member action dialog shell onto the chosen route, removing its own `useId` and its footer's restated comment. Verify: the test named after the scenario 'A footer submit names the form its dialog holds' written first and seen failing.
- [ ] 1.3 Move the display name, notes, deploy and share dialogs onto the same route, keeping any extra footer action beside the submit. Verify: the test named after the scenario 'A dialog with an extra footer action keeps it beside the submit' written first and seen failing for the notes dialog.
