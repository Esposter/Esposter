## Purpose

The webpage editor's form components and the Forms block category, absorbed from the grapesjs-plugin-forms package into our own plugin module, with each of its issues and pull requests given a verdict.

## Requirements

### Requirement: Saved pages load their form elements as form components

The webpage editor SHALL load a saved page's form, input, textarea, select, option, checkbox, radio, button and label elements as the matching form components.

#### Scenario: Saved page with a form

- **GIVEN** a saved page holding a form with an input and a button
- **WHEN** the owner opens the page in the editor
- **THEN** the form, the input and the button load as form components

### Requirement: The Forms category offers no blocks

The Forms block category SHALL list no blocks.

#### Scenario: Owner opens the Forms category

- **GIVEN** the webpage editor is open
- **WHEN** the owner opens the Forms category
- **THEN** no blocks are listed

### Requirement: The select options trait reads one value and label per line

The select options trait SHALL read one option per line as a value and a label separated by two colons, and SHALL keep everything after the first two colons as the label.

#### Scenario: Default select options

- **GIVEN** a select with its default options
- **WHEN** the owner opens its options trait
- **THEN** each line reads a value, two colons and the option's label

#### Scenario: Label containing colons

- **GIVEN** an option line whose label contains two colons
- **WHEN** the options are applied
- **THEN** the label keeps everything after its first two colons

### Requirement: Form interaction is held in the editor

A form's submit SHALL be prevented, and the select, checkbox, radio and button controls SHALL respond to clicks only in preview.

#### Scenario: Form submitted in the editor

- **GIVEN** a form on the canvas
- **WHEN** the owner submits it in the editor
- **THEN** the page does not submit

#### Scenario: Button clicked in the editor

- **GIVEN** a button on the canvas with the editor not in preview
- **WHEN** the owner clicks the button
- **THEN** the click does nothing

#### Scenario: Button clicked in preview

- **GIVEN** the editor is in preview
- **WHEN** the owner clicks a button
- **THEN** the button responds

### Requirement: A form's method defaults to GET

A form SHALL default its method to get, and its method choices SHALL be get and post only.

#### Scenario: New form dropped on the page

- **GIVEN** a new form dropped on the page
- **WHEN** the owner opens its method trait
- **THEN** the method reads get
- **AND** the choices are get and post

### Requirement: Inputs, textareas and selects take an id

Input, textarea and select elements SHALL take an id, so that a label's for can name them.

#### Scenario: Label pointing at an input

- **GIVEN** an input and a label on the page
- **WHEN** the owner sets the input's id and the label's for to the same value
- **THEN** the label's for names the input

### Requirement: A dropped label and button start with default text

A dropped label SHALL start with the text Label, and a dropped button SHALL start with the text Send.

#### Scenario: Label dropped

- **GIVEN** the owner drops a label on the page
- **WHEN** it appears on the canvas
- **THEN** its text reads Label

#### Scenario: Button dropped

- **GIVEN** the owner drops a button on the page
- **WHEN** it appears on the canvas
- **THEN** its text reads Send
