## 1. Key storage

- [ ] 1.1 Save the API key encrypted and return only its last four characters to the page. Verify: a test named after the scenario 'Saved key shows only its last four characters' written first and seen failing.
- [ ] 1.2 Encrypt the saved key at rest under the app's own key. Verify: a test named after the scenario 'A copy of the stored record reveals no key' written first and seen failing.
- [ ] 1.3 Replace and remove the saved key. Verify: tests named after the scenarios 'Replacing a saved key shows the new key's last four characters' and 'Removing a saved key stops hosted sessions' written first and seen failing.

## 2. Hosted driver

- [ ] 2.1 Translate the hosted session's events into the console's contract, and clone the named public repository as the first step. Verify: a test named after the scenario 'Session starts on a named public repository' written first and seen failing.
- [ ] 2.2 Decrypt the key only in the request that starts or drives a session, and keep it out of logs and output. Verify: a test named after the scenario 'The key appears in no log line, page message or session output' written first and seen failing.
- [ ] 2.3 Refuse a private repository and a start with no key saved. Verify: tests named after the scenarios 'A private repository is not started' and 'Starting a hosted session with no key saved is refused' written first and seen failing.

## 3. Connection in the page

- [ ] 3.1 Add the hosted connection to the sessions tab beside the other connections, with its API key form. Verify: a test named after the scenario 'Hosted option appears in the sessions tab' written first and seen failing.
- [ ] 3.2 Keep the hosted option off the first screen and ask for a key with no subscription sign-in. Verify: tests named after the scenarios 'First screen offers no hosted option' and 'Choosing the hosted connection asks for a key' written first and seen failing.
