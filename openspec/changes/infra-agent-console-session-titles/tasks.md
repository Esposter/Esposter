## 1. Rename on the host

- [ ] 1.1 Add the rename command, saving the title into the session's transcript, or holding it until the first prompt. Verify: a test named after the scenario 'A renamed title survives a reload' written first and seen failing.
- [ ] 1.2 Write a held title to the transcript at the session's first prompt. Verify: a test named after the scenario 'The first prompt saves the held title' written first and seen failing.
- [ ] 1.3 Update the open session's title on every connected page and refresh the sessions list. Verify: a test named after the scenario 'A rename shows on every connected page' written first and seen failing.

## 2. Editing in the page

- [ ] 2.1 Make the title an editable field in the heads-up display and in each sessions row. Verify: a test named after the scenario 'Enter saves the new title' written first and seen failing.
- [ ] 2.2 Keep the old title on Escape, and save nothing for an empty title. Verify: tests named after the scenarios 'Escape keeps the old title' and 'An empty title saves nothing' written first and seen failing.
- [ ] 2.3 Show the held title for a session with no transcript yet. Verify: a test named after the scenario 'A title is held before the first prompt' written first and seen failing.
