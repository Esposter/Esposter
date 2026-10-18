## Purpose

The webpage editor's basic layout and content blocks, absorbed from the grapesjs-blocks-basic package into our own plugin module, with the upstream's block ids and each of its open issues given a verdict.

## Requirements

### Requirement: The Basic category offers nine blocks

The webpage editor's Basic category SHALL offer nine blocks: three- and four-column layouts, text, link, image, video and map.

#### Scenario: Owner opens the Basic category

- **GIVEN** the webpage editor is open
- **WHEN** the owner opens the Basic category
- **THEN** nine blocks are listed
- **AND** they are the three- and four-column layouts, text, link, image, video and map

### Requirement: Column blocks resize and wrap

A column in a layout block SHALL be resizable, and its row SHALL wrap onto separate lines on a narrow canvas, as the page builder's mobile layout requires.

#### Scenario: Owner resizes a column

- **GIVEN** a two-column layout on the canvas
- **WHEN** the owner drags a column's resizer
- **THEN** that column's width changes

#### Scenario: Narrow canvas

- **GIVEN** a layout block on the canvas
- **WHEN** the canvas narrows
- **THEN** the columns wrap onto separate lines

### Requirement: Saved pages keep their block identities

Saved pages that use these blocks SHALL load with the same blocks under the same identities.

#### Scenario: Saved page with a column layout

- **GIVEN** a saved page using a column layout block
- **WHEN** the owner opens it in the editor
- **THEN** the layout loads unchanged

### Requirement: Dropping a video block requests no placeholder file

Dropping a video block SHALL NOT request a placeholder video file from the server.

#### Scenario: Video block dropped

- **GIVEN** the webpage editor's canvas
- **WHEN** the owner drops a video block
- **THEN** no request for a placeholder video is made
- **AND** no not-found error appears

### Requirement: Block labels are in English

The block labels SHALL be shown in English whatever the owner's language.

#### Scenario: Owner using another language

- **GIVEN** the owner's language is not English
- **WHEN** the owner opens the Basic category
- **THEN** the block labels are shown in English
