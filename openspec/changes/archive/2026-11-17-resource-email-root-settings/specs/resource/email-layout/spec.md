## MODIFIED Requirements

### Requirement: The inspector's tabs follow the selection

The inspector SHALL ask for a selection with nothing selected and offer the email's settings beside that request, SHALL show the Content and Style tabs with a node selected, and SHALL NOT offer a Theme tab.

#### Scenario: Nothing selected asks for a selection

- **GIVEN** an email with nothing selected
- **WHEN** the inspector is drawn
- **THEN** it asks the author to select a block
- **AND** it offers the email's settings

#### Scenario: A node selection offers Content and Style only

- **GIVEN** a text block selected
- **WHEN** the inspector is drawn
- **THEN** its tabs are Content and Style
