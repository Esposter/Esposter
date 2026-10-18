## 1. Channel server (built, tests owed)

No test carries these four scenarios' names yet, so the boxes are open until each named test is written and passes.

- [ ] 1.1 Serve the chat page on the loopback under a printed token, and drop lines without it. Verify: a test named after the scenario 'A line without the token is dropped' passes.
- [ ] 1.2 Deliver each typed line into the session as a desk line. Verify: a test named after the scenario 'A typed line becomes a session turn' passes.
- [ ] 1.3 Show the plain half of an answer under its line through the reply tool. Verify: a test named after the scenario 'An answer is shown under the line that asked' passes.
- [ ] 1.4 Start the channel with its session and end it with the session. Verify: a test named after the scenario 'The chat page stops answering when the session ends' passes.

## 2. Viewer and permission relay (waiting on the viewer stage)

- [ ] 2.1 Probe whether the viewer reports which choice was tapped; if it does not, the two choices are the page's own buttons. Verify: a test named after the scenario 'A tap on a choice answers the approval' written first and seen failing.
- [ ] 2.2 Declare the permission relay only when a viewer is on file. Verify: a test named after the scenario 'No viewer on file means no approval bubble' written first and seen failing.
- [ ] 2.3 Show a tool approval as a two-choice bubble with the tool's name and input. Verify: a test named after the scenario 'An approval appears as a two-choice bubble' written first and seen failing.

## 3. Flag and spoken lines

- [ ] 3.1 Probe whether the desktop app can be handed the channel flag; until it can, the chat page is the terminal's feature. Verify: a test whose scenario is 'A session without the channel flag takes no lines from the page' passes in the terminal path, and the probe's result is recorded in this change.
- [ ] 3.2 Keep the character's spoken lines off the chat page and show only the plain half of the answer. Verify: a test named after the scenario 'The character's spoken lines are not repeated on the page' written first and seen failing.
