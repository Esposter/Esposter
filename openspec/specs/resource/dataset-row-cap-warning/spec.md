## Purpose

Every dataset consumer says "showing N of M" when a read hits the 1000-row AZURE_MAX_PAGE_SIZE cap, instead of rendering truncated data as complete. The cap is shown as a warning on each surface; it does not load more rows.

## Requirements

### Requirement: A complete read shows no truncation warning

Every dataset consumer SHALL show no truncation warning when the read returned every row.

#### Scenario: A small survey shows no warning

- **GIVEN** a survey has fewer responses than the read cap
- **WHEN** the owner views its responses
- **THEN** no truncation banner is shown

### Requirement: A truncated read states how many rows it shows

Every dataset consumer SHALL say how many rows it shows and how many exist when a read hits the cap.

#### Scenario: A dashboard visual states the shown and total counts

- **GIVEN** a bound visual's source has more rows than the read cap
- **WHEN** the visual renders
- **THEN** a footnote says the chart shows the first rows, with the shown and total counts
- **AND** the chart is not presented as covering every row

#### Scenario: A published visual warns the same way

- **GIVEN** a published dashboard's visual was truncated when it was published
- **WHEN** a viewer opens the public dashboard
- **THEN** the visual shows the same footnote

#### Scenario: A very large total is shown as a floor

- **GIVEN** the row count reached its counting bound
- **WHEN** the consumer states the total
- **THEN** the total reads as at least that number, with a plus sign

### Requirement: The survey responses view warns with a banner

The survey responses view SHALL show a banner above the table when it has not loaded every response.

#### Scenario: A capped responses table shows a banner

- **GIVEN** a survey has more responses than the read cap
- **WHEN** the owner opens the responses view
- **THEN** a banner above the table shows how many responses are displayed out of the total

### Requirement: A personalized email export asks before it sends a partial audience

The email export SHALL ask the owner to confirm when the audience was truncated, and SHALL NOT export a partial audience without that confirmation.

#### Scenario: A truncated audience asks for confirmation

- **GIVEN** an email's audience has more rows than the read cap
- **WHEN** the owner runs a personalized export
- **THEN** a dialog states how many rows will not get an email
- **AND** the export waits for the owner to confirm

#### Scenario: Cancelling the confirmation exports nothing

- **GIVEN** the confirmation dialog is open for a truncated audience
- **WHEN** the owner cancels
- **THEN** no export is produced

#### Scenario: A complete audience exports without a dialog

- **GIVEN** an email's audience fits within the read cap
- **WHEN** the owner runs a personalized export
- **THEN** the export runs without a confirmation

### Requirement: A sheet import from a capped survey warns after the copy

The sheet dataset import SHALL warn after copying when the source was truncated.

#### Scenario: An import from a truncated source warns

- **GIVEN** the owner imports a survey into a sheet and the survey has more responses than the read cap
- **WHEN** the import finishes
- **THEN** a warning says the sheet holds only the rows that were read

### Requirement: Program participant generation reports rows left without a link

The program participant generation SHALL report how many audience rows received no link when the audience read was truncated.

#### Scenario: Generated links note the rows without one

- **GIVEN** a program's audience has more rows than the read cap
- **WHEN** the owner generates participant links
- **THEN** the status view names how many audience rows have no link
