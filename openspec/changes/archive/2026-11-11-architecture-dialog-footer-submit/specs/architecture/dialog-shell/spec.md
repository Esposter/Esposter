## ADDED Requirements

### Requirement: A footer submit names the form its dialog holds

A dialog whose footer submits its form SHALL reach the form through the shell, and SHALL NOT generate a form id of its own for the footer to name.

#### Scenario: A footer submit names the form its dialog holds

- **GIVEN** a dialog whose footer carries a submit button beside Cancel
- **WHEN** the owner presses the submit
- **THEN** the form in the dialog's body is submitted

#### Scenario: A dialog with an extra footer action keeps it beside the submit

- **GIVEN** a dialog whose footer carries an action besides Cancel and the submit
- **WHEN** the dialog opens
- **THEN** the extra action and the submit both show in the footer, and the submit submits the form
