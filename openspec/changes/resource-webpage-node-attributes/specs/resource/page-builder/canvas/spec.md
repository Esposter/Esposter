## ADDED Requirements

### Requirement: The Content panel edits a button's new-tab choice and every node's element id and title

The Content panel SHALL edit a button's new-tab choice, and SHALL edit the element id and the title of every webpage node.

#### Scenario: The Content panel sets a button to open in a new tab

- **GIVEN** a selected button on a page
- **WHEN** the owner sets its target to a new tab in the Content panel
- **THEN** the button's target is a new tab

#### Scenario: The Content panel sets an element id and title

- **GIVEN** a selected section on a page
- **WHEN** the owner sets its element id and its title in the Content panel
- **THEN** the section holds that element id and that title
