## Purpose

After each answered turn, up to three next steps the session itself suggests, drawn as buttons above the prompt; one press sends a step as the next prompt, and a dismiss clears them.

## Requirements

### Requirement: Each answered turn offers up to three next steps

After each answered turn the band SHALL show up to three next steps the session suggests, each as a button.

#### Scenario: A turn ending with an answer and open work

- **GIVEN** a turn that ends with an answer and work left to do
- **WHEN** the turn ends
- **THEN** up to three next-step buttons are shown

#### Scenario: A turn with nothing left to suggest

- **GIVEN** a turn whose work is finished or waits on the person
- **WHEN** the turn ends
- **THEN** no buttons are shown

#### Scenario: A turn that was interrupted

- **GIVEN** a turn that was interrupted, refused or failed
- **WHEN** the turn ends
- **THEN** no buttons are shown

#### Scenario: A subagent's turn

- **GIVEN** a turn run by a subagent
- **WHEN** it ends
- **THEN** no buttons are shown

### Requirement: A pressed step is sent as the next prompt

Pressing a step SHALL send it as the next prompt, exactly as if the person had typed it.

#### Scenario: Pressing a step button

- **GIVEN** the step buttons shown
- **WHEN** the person presses a step
- **THEN** the step is sent as the next prompt

#### Scenario: Pressing a step by its number

- **GIVEN** the band focused with steps shown
- **WHEN** the person presses 1, 2 or 3
- **THEN** the matching step is sent as the next prompt

### Requirement: Dismissing or sending a prompt clears the steps

Dismiss SHALL clear the steps, and any prompt the person sends, the clear command, and a resume SHALL clear them too.

#### Scenario: Pressing dismiss

- **GIVEN** the step buttons shown
- **WHEN** the person presses dismiss
- **THEN** the buttons are cleared

#### Scenario: Sending a prompt with steps shown

- **GIVEN** the step buttons shown
- **WHEN** the person sends a prompt
- **THEN** the buttons are cleared

### Requirement: The suggestions do not hold up the turn

The suggestions SHALL NOT delay the end of the turn or the next prompt.

#### Scenario: Sending a prompt while suggestions are being fetched

- **GIVEN** suggestions still being fetched after a turn
- **WHEN** the person sends the next prompt
- **THEN** the prompt is not held behind the suggestions

### Requirement: Waypoints off stops the suggestions

The waypoints off command SHALL stop the suggestions, and the waypoints on command SHALL bring them back.

#### Scenario: Turning waypoints off

- **GIVEN** waypoints on
- **WHEN** the person sends the off command
- **THEN** no further suggestions are offered

#### Scenario: Turning waypoints back on

- **GIVEN** waypoints off
- **WHEN** the person sends the on command
- **THEN** suggestions are offered after each answered turn again
