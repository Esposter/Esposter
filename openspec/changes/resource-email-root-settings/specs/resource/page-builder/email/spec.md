## ADDED Requirements

### Requirement: The email settings edit its head and body

The email settings SHALL edit the email's language, direction, title, font list, body width and body background, and each change SHALL show in the compiled email.

#### Scenario: Editing the title sets the title of the compiled email

- **GIVEN** an email open with nothing selected
- **WHEN** the owner types a title in the settings
- **THEN** the compiled email carries that title

#### Scenario: The language setting sets the language of the email

- **GIVEN** an email open with nothing selected
- **WHEN** the owner sets the language to a language tag
- **THEN** the compiled email declares that language

#### Scenario: The direction setting turns the email right to left

- **GIVEN** an email open with nothing selected
- **WHEN** the owner chooses right to left
- **THEN** the compiled email is right to left

#### Scenario: A body width sets the width of the email

- **GIVEN** an email open with nothing selected
- **WHEN** the owner sets the body width to a pixel length
- **THEN** the design canvas draws the email at that width

#### Scenario: A body width that is not a pixel length is refused

- **GIVEN** an email open with nothing selected
- **WHEN** the owner types a body width that is not a pixel length
- **THEN** the field shows the refusal
- **AND** the email keeps its last width

#### Scenario: A font added to the list loads in the compiled email

- **GIVEN** an email open with nothing selected
- **WHEN** the owner adds a font with its name and stylesheet address
- **THEN** the compiled email loads that stylesheet

#### Scenario: A font address with a script scheme is refused

- **GIVEN** an email open with nothing selected
- **WHEN** the owner adds a font whose address uses a scheme that is not allowed
- **THEN** the field shows the refusal
- **AND** the font is not added

#### Scenario: A font beyond the list limit is refused

- **GIVEN** an email whose font list is at its limit
- **WHEN** the owner adds another font
- **THEN** the add is refused
- **AND** the list is unchanged

#### Scenario: Clearing a settings field removes it from the email

- **GIVEN** an email whose title is set
- **WHEN** the owner clears the title
- **THEN** the compiled email has no title

#### Scenario: A settings change is one undo step

- **GIVEN** an email whose title was changed in the settings
- **WHEN** the owner undoes once
- **THEN** the title is its earlier value
