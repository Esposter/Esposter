## ADDED Requirements

### Requirement: A webpage button opens its link in the same tab or a new tab

A webpage button SHALL open its link in the same tab or in a new tab, as its target chooses.

#### Scenario: A same-tab button publishes no new-tab attribute

- **GIVEN** a webpage button whose target is the same tab
- **WHEN** the webpage is published
- **THEN** the published link has no target attribute

#### Scenario: A new-tab button publishes with a safe relationship

- **GIVEN** a webpage button whose target is a new tab and which sets no relationship
- **WHEN** the webpage is published
- **THEN** the published link opens in a new tab
- **AND** its relationship is noopener

#### Scenario: A new-tab button keeps its own relationship and adds noopener

- **GIVEN** a webpage button whose target is a new tab and whose relationship is nofollow
- **WHEN** the webpage is published
- **THEN** the published relationship is nofollow and noopener

#### Scenario: A target outside the two choices is refused on save

- **GIVEN** a webpage button whose target names a window other than the same tab or a new tab
- **WHEN** the owner saves the document
- **THEN** the save is refused

### Requirement: A webpage node takes an element id and a title

A webpage node SHALL take an element id and a title, which its published element carries.

#### Scenario: An element id links to its element from a button

- **GIVEN** a section with the element id pricing and a button whose address is the fragment pricing
- **WHEN** the reader follows the button
- **THEN** the page moves to the section

#### Scenario: A title shows as the tooltip of its element

- **GIVEN** an image with the title Logo
- **WHEN** the webpage is published
- **THEN** the published image carries the title Logo

#### Scenario: An empty element id publishes no id

- **GIVEN** a node whose element id is empty
- **WHEN** the webpage is published
- **THEN** the published element carries no id attribute

#### Scenario: An element id with a space is refused on save

- **GIVEN** a node whose element id holds a space
- **WHEN** the owner saves the document
- **THEN** the save is refused

#### Scenario: Two nodes with one element id are refused on save

- **GIVEN** two nodes in one webpage with the element id pricing
- **WHEN** the owner saves the document
- **THEN** the save is refused
