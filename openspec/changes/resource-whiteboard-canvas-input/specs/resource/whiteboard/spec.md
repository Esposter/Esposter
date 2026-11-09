## ADDED Requirements

### Requirement: A dropped image is placed centred on the drop point

An image file dropped onto the canvas SHALL be stored as a file asset of the whiteboard and placed centred on the point where it was dropped.

#### Scenario: A dropped image is stored as a file asset and placed at the drop point

- **GIVEN** a whiteboard open in its editor
- **WHEN** the owner drops a PNG image on the canvas at a point
- **THEN** the image is uploaded to the whiteboard's file assets
- **AND** an image element is centred on the drop point and holds the file's id

#### Scenario: A dropped file that is not an image places nothing

- **GIVEN** a whiteboard open in its editor
- **WHEN** the owner drops a text file on the canvas
- **THEN** no element is added

#### Scenario: An image that fails to upload alerts and places nothing

- **GIVEN** a whiteboard open in its editor
- **WHEN** the owner drops an image whose upload the server refuses
- **THEN** the owner is alerted
- **AND** no element is added

### Requirement: An image holds alt text that names it

An image SHALL hold alt text, which the owner sets from the properties panel, and which SHALL name the image to assistive technology on the canvas and in the SVG export.

#### Scenario: Setting alt text from the properties panel names the image

- **GIVEN** a selected image
- **WHEN** the owner types Quarterly chart as its alt text and leaves the field
- **THEN** the image is named Quarterly chart on the canvas
- **AND** the SVG export names the image Quarterly chart

#### Scenario: A new image starts with no alt text

- **GIVEN** an image placed by paste
- **WHEN** the owner selects the image
- **THEN** its alt text field is empty

#### Scenario: Clearing alt text removes the name from the export

- **GIVEN** an image with alt text Quarterly chart
- **WHEN** the owner clears its alt text and exports the whiteboard as SVG
- **THEN** the export names the image with no alt text

### Requirement: The Q key locks the tool in hand

The Q key SHALL toggle the tool lock, so that a tool stays in hand after one use while the lock is on, as the toolbar's lock button does.

#### Scenario: Q locks the tool in hand

- **GIVEN** the rectangle shape tool selected
- **WHEN** the owner presses Q and places a shape
- **THEN** the rectangle tool is still in hand

#### Scenario: Q with the lock on releases it

- **GIVEN** the tool lock on
- **WHEN** the owner presses Q and then places a shape
- **THEN** the tool returns to select after the placement

#### Scenario: Q typed into a text edit is not a lock

- **GIVEN** an element's text open for editing
- **WHEN** the owner types the letter q
- **THEN** the letter is typed into the text
- **AND** the tool lock is unchanged
