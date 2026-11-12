# Tasks

## 1. The rules

- [ ] 1.1 Add the rules section to the program content with the reminder rule, refusing a rule that allows nothing, and the rule's fields in the Setup blade. Verify: tests named after the scenarios 'A reminder rule is kept with the program' and 'A reminder rule that allows nothing is refused' written first and seen failing.

## 2. The planner

- [ ] 2.1 Write the pure planner that answers due an invite, due a reminder or due nothing from a person's dispatch record, whether they responded, the rules and the current time. Verify: tests named after the scenarios 'A person never invited is due an invite', 'A person who responded is due nothing', 'A reminder is due once the delay has passed', 'A reminder is not due before the delay', 'A person at the most reminders is due nothing' and 'Without a rule an invited person who has not responded is due a reminder' written first and seen failing.

## 3. The record

- [ ] 3.1 Add the invitation date, the last dispatch date and the reminder count to the participant record, and write them when an export succeeds and not when it is refused. Verify: tests named after the scenarios 'An invite export records the invitation', 'A reminder export counts the reminder' and 'A refused export records nothing' written first and seen failing.

## 4. The links

- [ ] 4.1 Issue the missing links when a dispatch is read or the links are downloaded, keep the storage-key guarantee, and remove the generate procedure and its button. Verify: tests named after the scenarios 'A dispatch issues the links nobody has yet', 'A person keeps their link across dispatches', 'Two dispatches at once give one link per person', 'A dispatch without a bound survey is refused' and 'A dispatch is refused after the survey is deleted' written first and seen failing.

## 5. The surfaces

- [ ] 5.1 Take the invite and reminder exports and the links file from the planner's people. Verify: tests named after the scenarios 'The download includes earlier participants', 'Exporting invites gives each person a filled file', 'Exporting reminders covers only those due one', 'An email without a link to the survey is refused', 'An unbound part is refused before any read' and 'A person past the read limit is counted, not filled' written first and seen failing.
- [ ] 5.2 Show the dispatch facts and the due counts in the Status blade. Verify: tests named after the scenarios 'The status view lists people with their dispatch facts', 'The status view says how many are due', 'A draft answer does not count as responded' and 'Status shows no links' written first and seen failing.
- [ ] 5.3 Add the invitation date and the reminder count to the status dataset, without the key value or the link. Verify: tests named after the scenarios 'A dashboard shows the funnel without identities' and 'A published dashboard publishes no key values' written first and seen failing.
- [ ] 5.4 Keep the Setup and Status behaviour for a deleted binding under the dispatch. Verify: tests named after the scenarios 'A deleted survey is named as missing' and 'Status stays readable after a survey is deleted' written first and seen failing.

## 6. The record of the decision

- [ ] 6.1 Rewrite the program resource's design as built, with the policy and run layers and the planner, and update the survey response modes page where it names generating participants. Verify: `pnpm exec openspec validate resource-program-send-rules --strict --no-interactive` passes.
