## 1. The command

- [ ] 1.1 Offer Ask Claude in the toolbar and command palette of every resource type's editor. Verify: a test named after the scenario 'Ask Claude is available in any type's editor', failing first, then passing.
- [ ] 1.2 Send the person's line as a prompt to the session they pick, or to a new session in the folder they choose, with the resource named by id and type. Verify: a test named after the scenario 'The line reaches an open session', failing first, then passing; and the scenario 'A new session starts when none is open'.
- [ ] 1.3 Show the pairing steps when no host is paired, and send nothing. Verify: a test named after the scenario 'Pairing is explained when no host is paired', failing first, then passing.

## 2. The person's own key

- [ ] 2.1 Connect the session to Esposter with the person's own key, and show the steps to connect a key when none holds the Resources scope, as the follow-ups dialog does. Verify: a test named after the scenario 'The steps to connect a key are shown when none holds the scope', failing first, then passing; and the scenario 'A key without the Resources scope cannot edit'.
- [ ] 2.2 Record each assistant edit in the activity under the key that made it. Verify: a test named after the scenario 'An assistant edit is recorded under the person's key', failing first, then passing.

## 3. The open editor

- [ ] 3.1 Show an assistant's saved edit in the open editor as it arrives, and offer a choice over an unsaved edit. Depends on the live edits change, so it is built after it. Verify: a test named after the scenario 'An edit arriving over an unsaved edit is offered as a choice', failing first, then passing.
- [ ] 3.2 Confirm the turn runs on the person's host with no model call or charge from Esposter. Verify: a test named after the scenario 'A turn runs in the person's session', failing first, then passing.
