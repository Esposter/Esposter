# resource/page-builder Specification

## Purpose

What every page builder document holds to, whichever editor opens it: a published webpage or email is produced on the server, and every pointer action has a keyboard path.

## Requirements

### Requirement: A published page is produced on the server

A published webpage or email SHALL be produced on the server at publish, and a reader SHALL receive that output without the editor.

#### Scenario: A published page is produced on the server

- **GIVEN** a webpage published from the editor
- **WHEN** a reader opens the published page
- **THEN** the page shows the output produced at publish
- **AND** the page loads no script from the editor

### Requirement: Every pointer action has a keyboard path

Every drag and every pointer action in the page builder SHALL have a keyboard or single-pointer alternative.

#### Scenario: A block can be moved with the keyboard alone

- **GIVEN** a block selected in a webpage
- **WHEN** the owner moves it with the keyboard
- **THEN** the block moves to the new position without a drag
