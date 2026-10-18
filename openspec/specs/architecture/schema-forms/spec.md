## Purpose

How a form generated from a Zod schema is drawn — JSON Forms' core lays out the JSON Schema the app generates, the UI library draws every node of it, and the Zod schema validates it — why the engine was adopted and its Vue shell written, and what AJV is still there for.

## Requirements

### Requirement: Forms show every field their schema describes

A form built from a validation schema SHALL show every field the schema describes, laid out in the order the schema gives them.

#### Scenario: A settings dialog shows its schema fields

- **GIVEN** a dialog whose form is generated from its validation schema
- **WHEN** the reader opens the dialog
- **THEN** every field the schema describes appears as a control
- **AND** the controls follow the order of the schema

### Requirement: Each field kind is drawn with its own control

Each field SHALL be drawn with the control for its kind, so that choices, text, yes-or-no values, nested groups and lists each have one control type.

#### Scenario: A choice field is drawn as a choice list

- **GIVEN** a field whose value must be one of a fixed set of choices
- **WHEN** the form is shown
- **THEN** the field is drawn as a choice list that holds one value or several, as the field allows

#### Scenario: A yes-or-no field is drawn as a checkbox

- **GIVEN** a field whose value is yes or no
- **WHEN** the form is shown
- **THEN** the field is drawn as a checkbox

#### Scenario: A list field is drawn as a card per item

- **GIVEN** a field that holds a list of items
- **WHEN** the reader adds, moves or removes an item
- **THEN** each item is shown as its own card, and the list changes accordingly

### Requirement: Layout hints are typed data, never expressions

A field SHALL ask for a multi-line box or for choices drawn from its dialog's own items only through typed layout data, never through an expression that is evaluated at runtime.

#### Scenario: A field marked as multi-line

- **GIVEN** a text field marked as needing several lines
- **WHEN** the form is shown
- **THEN** the field shows several lines of text

#### Scenario: A choice list drawn from the dialog's own items

- **GIVEN** a field that names a list the dialog itself provides
- **WHEN** the form is shown
- **THEN** the field's choices are the items that dialog provides

### Requirement: The schema validates the whole form after every change

The form SHALL check its whole value against its validation schema after every change and SHALL show each issue on the field it concerns once the reader has changed that field.

#### Scenario: An invalid value shows an issue on its field

- **GIVEN** a form with a field whose value the schema rejects
- **WHEN** the reader changes that field to the rejected value
- **THEN** the issue appears on that field

#### Scenario: An untouched field shows no issue yet

- **GIVEN** a required field the reader has not changed
- **WHEN** the form first opens
- **THEN** no issue is shown on that field

### Requirement: Switching a variant keeps shared values and drops the old variant's own

Switching a choice between variants SHALL keep the fields the variants share and anything the schema does not describe, and SHALL drop the fields that belong only to the variant being left.

#### Scenario: Switching a column's type keeps its identity

- **GIVEN** a column whose type has its own fields and whose id is not described by any variant
- **WHEN** the reader switches the column to another type
- **THEN** the column's id and its shared fields are kept
- **AND** the fields that belonged only to the old type are removed

#### Scenario: A shared field picked from a different list is dropped

- **GIVEN** a shared field that the two variants choose from different lists
- **WHEN** the reader switches the variant
- **THEN** the field's value is dropped, because the new list never offered the old choice

### Requirement: Form components are written in the app's own component style

The visible components of a schema form SHALL be written in the app's own component style, with the schema engine supplying only layout and value logic.

#### Scenario: A component written in the older option style fails its test

- **GIVEN** a form component that uses the older option-style component API
- **WHEN** the test suite runs
- **THEN** the component's test fails rather than the app failing at runtime
