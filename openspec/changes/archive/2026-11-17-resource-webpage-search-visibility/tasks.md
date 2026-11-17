# Tasks

## 1. The setting

- [x] 1.1 Add the search-visibility switch to the webpage settings model, on until turned off.
- [x] 1.2 Add the switch to the Settings blade. Verify: a test named after the scenario 'The owner turns search listing off' written first and seen failing.

## 2. The published head

- [x] 2.1 Write a noindex directive into the published page's head when the published snapshot has the switch off. Verify: tests named after the scenarios 'A page hidden from search tells crawlers not to list it' and 'A page that is listed carries no robots directive' written first and seen failing.
