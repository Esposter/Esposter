## Purpose

The webpage editor's countdown block, absorbed from the grapesjs-component-countdown package into our own plugin module, with the upstream's issues given a verdict and the defects its source showed fixed.

## Requirements

### Requirement: The Extra category offers a countdown block

The webpage editor's Extra category SHALL offer a countdown block that shows days, hours, minutes and seconds to a start date.

#### Scenario: Owner drops a countdown

- **GIVEN** the webpage editor is open
- **WHEN** the owner drops a countdown block on the page
- **THEN** a countdown showing days, hours, minutes and seconds to its start date appears

### Requirement: A date-only start counts to local midnight

A start date given without a time SHALL count down to midnight at the start of that day in the viewer's local time.

#### Scenario: Start date with no time

- **GIVEN** a countdown whose start is set to a date only
- **WHEN** a viewer sees the countdown
- **THEN** it counts down to local midnight at the start of that day

### Requirement: The countdown shows its end text once the start has passed

When the start date has passed, the countdown SHALL hide its clock and show its end text.

#### Scenario: Start date has passed

- **GIVEN** a countdown whose start date has passed
- **WHEN** a viewer sees it
- **THEN** its clock is hidden
- **AND** its end text is shown

### Requirement: The end text is shown as text, never as markup

The end text SHALL be shown as plain text, so markup typed into it does not run in a published page.

#### Scenario: Markup in the end text

- **GIVEN** an end text containing script markup
- **WHEN** the start date has passed in a published page
- **THEN** the markup is shown as text
- **AND** no script runs

### Requirement: The Start and End text traits set the countdown

The Start and End text traits SHALL set the countdown's start date and end text, and a change SHALL update the countdown at once.

#### Scenario: Owner changes the start date

- **GIVEN** a countdown selected in the editor
- **WHEN** the owner changes its Start trait
- **THEN** the countdown updates to count down to the new start

### Requirement: A re-rendered countdown stops its earlier timer

A countdown SHALL stop counting once it is removed from the page or re-rendered, leaving no timer running.

#### Scenario: Countdown re-rendered by a trait change

- **GIVEN** a countdown on the canvas
- **WHEN** a trait change re-renders it
- **THEN** its earlier timer stops
- **AND** only the new countdown runs
