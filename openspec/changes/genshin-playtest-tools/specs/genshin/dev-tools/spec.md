## ADDED Requirements

### Requirement: The developer surface exists only in a development build

The game SHALL offer its console and panel only in a development build, SHALL register no command in a production build, and SHALL mount neither surface in a browser driven by automation.

#### Scenario: Development build offers the console and the panel

- **GIVEN** the game runs from the development server in an ordinary browser
- **WHEN** the owner presses the backtick key or F2
- **THEN** the console or the panel opens

#### Scenario: Production build offers neither

- **GIVEN** the game runs from a production build
- **WHEN** the owner presses the backtick key or F2
- **THEN** nothing opens and no command is registered

#### Scenario: Browser driven by automation registers commands and mounts no surface

- **GIVEN** the game runs from the development server in a browser driven by automation
- **WHEN** the world loads
- **THEN** the commands are reachable through `window.__dev` and neither surface mounts

### Requirement: A console line runs a registered command

The console SHALL run a line as the command named first with the arguments after it, and SHALL show the command's result or its error.

#### Scenario: Valid line runs and reports

- **GIVEN** the world is running and the command `time` is registered
- **WHEN** the owner enters `time 21:00`
- **THEN** the game's clock is set to nine in the evening
- **AND** the console shows the result

#### Scenario: Bad argument runs nothing

- **GIVEN** the command `give` takes an item name and a count
- **WHEN** the owner enters `give Mora lots`
- **THEN** the command does not run
- **AND** the console shows the argument's error and the command's usage

#### Scenario: Unknown name is refused

- **WHEN** the owner enters a name no command has
- **THEN** the console says the command is unknown and lists the names that contain it

#### Scenario: Command whose state is not mounted says so

- **GIVEN** the command `heal` is registered by the world session and the session is not mounted
- **WHEN** the owner enters `heal`
- **THEN** the console says the command is not available here

### Requirement: A command's result is structured and compact

A command SHALL return `ok` with a value, or `ok: false` with an error and its usage, and the value SHALL be a count, a rounded number or a name rather than a dump.

#### Scenario: Automation receives data

- **GIVEN** a browser driven by automation
- **WHEN** it calls `window.__dev.run("state")`
- **THEN** it receives the position, place, hour, weather, health and party as one record

#### Scenario: Failure returns its usage

- **WHEN** a command is called with an argument it refuses
- **THEN** the result is `ok: false` with the error and the command's usage

### Requirement: A variable is one value set from either face

A variable SHALL be set by the console's `set` command and by its control in the panel, SHALL show its current value in both, and SHALL start from the game's own value on every load.

#### Scenario: Control and console agree

- **GIVEN** the panel shows the cloud coverage control
- **WHEN** the owner enters `set cloud coverage 0.8` in the console
- **THEN** the control shows 0.8 and the sky draws the cloud coverage 0.8

#### Scenario: Reload restores the game's value

- **GIVEN** a variable was changed
- **WHEN** the page is reloaded
- **THEN** the variable holds the game's own value

#### Scenario: Out of range is refused

- **GIVEN** a variable with a range
- **WHEN** the owner sets a value outside it
- **THEN** the value is not changed and the range is shown

### Requirement: A scenario puts the game in a named state

A scenario SHALL run its commands in order, show each result, and stop at the first command that fails, naming it.

#### Scenario: Scenario applies its commands in order

- **GIVEN** a scenario of a teleport, a time and a give
- **WHEN** the owner runs it from the panel
- **THEN** the three commands run in that order and each result is shown

#### Scenario: Failure stops the scenario

- **GIVEN** a scenario whose second command fails
- **WHEN** the owner runs it
- **THEN** the third command does not run
- **AND** the failed command is named

### Requirement: The stats overlay reads the renderer's counters

The stats overlay SHALL show the median frame time over the last sixty frames, the draw calls and the triangles, and SHALL hide when toggled off.

#### Scenario: Overlay shows the counters

- **GIVEN** the world is running
- **WHEN** the owner enters `stat on`
- **THEN** the overlay shows the frame time, draw calls and triangles

#### Scenario: Toggle hides it

- **GIVEN** the overlay is shown
- **WHEN** the owner enters `stat off`
- **THEN** the overlay is hidden

### Requirement: Three's inspector is not attached

No scene SHALL be given three's inspector, and the look's tunable values SHALL be reached through the panel's Look tab.

#### Scenario: Development scene has no inspector

- **GIVEN** the game runs from the development server in an ordinary browser
- **WHEN** the world loads
- **THEN** no inspector panel is drawn over the canvas

#### Scenario: Look values are in the panel

- **GIVEN** the panel is open on the Look tab
- **WHEN** the owner changes the outline thickness
- **THEN** the world's outline thickness changes at once
