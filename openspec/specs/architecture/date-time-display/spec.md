## Purpose

Every date a reader sees is a NuxtTime — formatted in their locale and timezone, without a hydration mismatch.

## Requirements

### Requirement: Every date a reader sees uses the reader's locale and time zone

Every date a reader sees SHALL be shown in that reader's own locale and time zone.

#### Scenario: A reader in another time zone sees their own local time

- **GIVEN** a reader is in a time zone different from the server's
- **WHEN** the reader views a post's time
- **THEN** the time is shown in the reader's time zone and in the reader's locale format

#### Scenario: A recent post reads as a relative phrase

- **GIVEN** a post was created a few minutes ago
- **WHEN** the reader views the post
- **THEN** its time reads as a relative phrase in the reader's language

### Requirement: A date renders the same text on the server and in the browser

A date SHALL render the same text on the server and in the browser, so the page never reports a hydration mismatch.

#### Scenario: A server-rendered date is replaced by the browser's text before hydration

- **GIVEN** a page with dates is rendered by the server
- **WHEN** the browser loads the page
- **THEN** each date shows the browser's own formatting
- **AND** no mismatch is reported when the page hydrates

### Requirement: A relative time keeps itself current

A relative time SHALL update its wording on its own while it is shown.

#### Scenario: A relative time advances without a reload

- **GIVEN** a relative time is on screen
- **WHEN** a minute passes
- **THEN** its wording advances without the page reloading

### Requirement: Hover text is the exact UTC instant unless the page gives its own

A date's hover text SHALL be its exact instant in UTC, unless the page gives it its own text.

#### Scenario: Hovering a timestamp shows the UTC instant

- **GIVEN** a timestamp has no custom hover text
- **WHEN** the reader hovers it
- **THEN** the hover text is the exact instant in UTC

#### Scenario: Hovering a timestamp with custom text shows that text

- **GIVEN** the page gives a timestamp its own hover text
- **WHEN** the reader hovers it
- **THEN** the custom text is shown

### Requirement: A calendar day shows the day it names for every reader

A calendar day with no time SHALL show the day it names for every reader, wherever they are.

#### Scenario: A far-off time zone still shows the named day

- **GIVEN** a reader is in a time zone far from UTC
- **WHEN** a calendar day is shown
- **THEN** the day shown is the day the calendar names, not the day before or after

### Requirement: Dates written into data use one fixed format

A date written into a file, an export or a sortable cell SHALL use one fixed format rather than the reader's locale.

#### Scenario: An exported sheet writes its dates in the fixed format

- **GIVEN** a sheet holds dates
- **WHEN** the reader exports the sheet to a file
- **THEN** the dates in the file use the fixed format

#### Scenario: A date typed into a date cell reads back as the same date

- **GIVEN** a reader types a date into a date cell
- **WHEN** the cell stores the value
- **THEN** the cell shows the same date when read back

### Requirement: The message list labels its days on the reader's own day boundary

The message list's day labels SHALL follow the reader's own day boundary and show times on a 24-hour clock.

#### Scenario: A message from yesterday is labelled with yesterday

- **GIVEN** a message was sent yesterday at 14:03
- **WHEN** the reader views the message list
- **THEN** the message is labelled Yesterday at 14:03

#### Scenario: Messages from different days are separated by a divider

- **GIVEN** messages from two different days are in the list
- **WHEN** the reader views the list
- **THEN** a day divider separates the two days

### Requirement: A template formats dates only through the shared display

A template SHALL show dates only through the shared date display, and the build's lint check SHALL fail any template that formats a date another way.

#### Scenario: A template that formats a date itself fails lint

- **GIVEN** a feature formats a date inside a component template outside the shared display
- **WHEN** the lint check runs
- **THEN** the check fails
