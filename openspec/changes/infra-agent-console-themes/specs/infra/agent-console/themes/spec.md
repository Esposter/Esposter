## ADDED Requirements

### Requirement: A theme never removes a control terminal parity needs

The console SHALL keep every control that terminal parity needs under every theme.

#### Scenario: The Genshin theme keeps the controls terminal parity needs

- **GIVEN** the reader has the Genshin theme chosen for a session
- **WHEN** the console is shown
- **THEN** every control terminal parity needs is still shown

### Requirement: The Genshin theme's palette follows the session character's element

The console SHALL colour the Genshin theme's panels from the element of the session's character.

#### Scenario: The session character's element sets the palette

- **GIVEN** a session was started by a character of the Pyro element
- **WHEN** the Genshin theme is shown for it
- **THEN** the panels take the Pyro element's colour

#### Scenario: A session with no character keeps the default palette

- **GIVEN** a session has no character
- **WHEN** the console is shown for it
- **THEN** the panels take the default palette

### Requirement: Each spoken line is synthesized once

The console SHALL send each spoken line in a reply to the resident synthesizer once, and SHALL NOT synthesize the same line twice.

#### Scenario: A spoken line is synthesized once

- **GIVEN** a reply contains a spoken line and the Genshin theme is shown
- **WHEN** the reply arrives
- **THEN** the line is synthesized once
- **AND** the line plays once

### Requirement: A session keeps the look of the theme that began it

The console SHALL keep each session in the look of the theme whose plugin started that session.

#### Scenario: Parallel sessions keep their own looks

- **GIVEN** a Genshin session and a default session are open together
- **WHEN** the reader switches between them
- **THEN** each session keeps its own look

### Requirement: Notifications when the tab is hidden show under every theme

The console SHALL show a notification when the tab is hidden and attention is wanted, under every theme.

#### Scenario: A hidden tab notifies under the Genshin theme

- **GIVEN** the Genshin theme is shown and the tab is hidden
- **WHEN** a session wants the reader's attention
- **THEN** a notification is shown

### Requirement: The Genshin theme's reactions run only under that theme

The console SHALL run the Genshin theme's reactions only while that theme is shown for a session.

#### Scenario: The default theme runs no reaction

- **GIVEN** a session uses the default theme
- **WHEN** the session starts
- **THEN** no wish banner or character reaction is shown
