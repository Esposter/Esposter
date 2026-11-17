## ADDED Requirements

### Requirement: The style panel offers each property in one sector, including the common properties the sectors lacked

The style panel SHALL offer each of its properties in exactly one sector, and SHALL offer flex wrap, float, minimum height, overflow, z-index, font style, text transform, transform, transition and cursor.

#### Scenario: A property the sectors lacked is set in its sector

- **GIVEN** a section whose display is set to flex
- **WHEN** the owner sets its flex wrap to wrap in the Layout sector
- **THEN** the section wraps its children on the canvas and in the published page

#### Scenario: The Effects sector sets a transform

- **GIVEN** a button on a page
- **WHEN** the owner sets its transform to a rotation of 10 degrees in the Effects sector
- **THEN** the button is rotated on the canvas and in the published page

#### Scenario: An unsupported value for a new property is not saved

- **GIVEN** a section whose z-index is 2
- **WHEN** the owner types a z-index the browser does not support
- **THEN** the field shows an error
- **AND** the section keeps a z-index of 2
