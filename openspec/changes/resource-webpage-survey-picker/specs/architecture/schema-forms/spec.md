## ADDED Requirements

### Requirement: A field that names another resource is drawn as a picker of that resource's type

A schema form SHALL draw a field declared as a link to another resource with a picker of the owner's resources of the declared type. A field without that declaration keeps its plain control.

#### Scenario: A link field offers the owner's resources of its type

- **GIVEN** a form whose field names a survey resource
- **WHEN** the reader opens the field
- **THEN** the field offers the owner's surveys
- **AND** choosing one writes its id to the field

#### Scenario: A plain id field stays a text control

- **GIVEN** a form whose field is a plain identifier with no link declaration
- **WHEN** the reader opens the form
- **THEN** the field is drawn as a text control
