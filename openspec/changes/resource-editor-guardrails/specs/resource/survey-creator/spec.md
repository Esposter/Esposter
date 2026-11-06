## MODIFIED Requirements

### Requirement: The owner adds a question from the palette

The palette SHALL insert a chosen question kind after the selected element, or, when the selection is a page, at the end of that page, and with nothing selected at the end of the first page. The inserted question is selected. The palette SHALL list only the kinds the insertion point accepts.

#### Scenario: Owner adds a rating question

- **GIVEN** the owner is editing a survey whose first question is selected
- **WHEN** the owner chooses the rating kind in the palette
- **THEN** a rating question is inserted directly after the selected question
- **AND** the new question is selected

#### Scenario: Owner adds a question to a selected page

- **GIVEN** the owner has selected a page with two questions
- **WHEN** the owner chooses the text kind in the palette
- **THEN** a text question is inserted at the end of the page
- **AND** the new question is selected
