# Tasks

## 1. The list

- [ ] 1.1 Add the optional allowed values to the parameter model, with the default held to the list. Verify: tests named after the scenarios 'A default outside the list is refused' and 'A parameter with no list stays free text' written first and seen failing.

## 2. The check

- [ ] 2.1 Refuse a deploy whose value for a listed parameter is not in its list, before anything is created. Verify: tests named after the scenarios 'A value outside the list is refused and nothing is created' and 'A value in the list deploys' written first and seen failing.

## 3. The dialog

- [ ] 3.1 Draw a parameter with a list as a choice of its values, prefilled with its default. Verify: a test named after the scenario 'The dialog offers a listed parameter as a choice' written first and seen failing.
