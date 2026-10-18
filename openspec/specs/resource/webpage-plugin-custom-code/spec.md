## Purpose

The webpage editor's custom code block, absorbed from the grapesjs-custom-code package into our own plugin module, with the upstream's issues and pull requests given a verdict, the XSS surface they show, and the defects fixed. The parser's checks on javascript URLs and some attributes are weaker than they look, and this capability does not cover them.

## Requirements

### Requirement: The Extra category offers a custom code block

The webpage editor's Extra category SHALL offer a custom code block that opens a code editor with a Save button when the owner double-clicks it.

#### Scenario: Owner double-clicks the block

- **GIVEN** a custom code block on the page
- **WHEN** the owner double-clicks it
- **THEN** the code editor opens with a Save button

### Requirement: Custom code appears on the canvas as the markup it holds

The block SHALL show the HTML the owner saved in its code editor as markup on the canvas.

#### Scenario: Owner saves markup

- **GIVEN** the owner has entered markup in the code editor
- **WHEN** the owner saves
- **THEN** the canvas shows that markup

### Requirement: Script elements and event handlers are removed

Script elements and event-handler attributes in custom code SHALL NOT appear on the canvas or in the exported HTML.

#### Scenario: Script in the code

- **GIVEN** custom code containing a script element
- **WHEN** the owner saves and exports the page
- **THEN** the script is absent from the canvas
- **AND** the script is absent from the exported HTML

#### Scenario: Event handler attribute in the code

- **GIVEN** custom code containing an onclick attribute
- **WHEN** the owner saves and exports the page
- **THEN** the attribute is absent from the exported HTML

### Requirement: Code containing a script shows a placeholder

Custom code that still contains a script tag SHALL show a placeholder on the canvas instead of its markup, and the block SHALL NOT accept drops.

#### Scenario: Code contains a script tag

- **GIVEN** custom code containing a script tag
- **WHEN** the code is shown on the canvas
- **THEN** a placeholder is shown instead of its markup
- **AND** nothing can be dropped into the block

### Requirement: Each block keeps its own placeholder

Each custom code block SHALL show its own placeholder, so a change to one block SHALL NOT cancel another block's placeholder.

#### Scenario: Two blocks with script tags

- **GIVEN** two custom code blocks that each contain a script tag
- **WHEN** both are changed
- **THEN** each block shows its own placeholder

### Requirement: Empty code keeps the default text

A custom code block saved with empty code SHALL keep its default text, so it can still be clicked to edit.

#### Scenario: Owner empties the code

- **GIVEN** a custom code block
- **WHEN** the owner saves an empty code
- **THEN** the block shows its default text
- **AND** the owner can double-click it to edit

### Requirement: A reloaded page keeps custom code as plain markup

A saved and reloaded webpage SHALL keep its custom code as plain markup rather than as the custom code block.

#### Scenario: Page reopened after saving

- **GIVEN** a webpage with a custom code block
- **WHEN** the page is saved and then reopened in the editor
- **THEN** the code appears as plain markup
- **AND** it is not editable through the custom code block
