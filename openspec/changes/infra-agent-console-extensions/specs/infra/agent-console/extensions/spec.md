## ADDED Requirements

### Requirement: A tool's declared interface renders inline under its tool call

The console SHALL render the interface a tool declares inline under the tool call that produced it.

#### Scenario: An app appears under its tool call

- **GIVEN** the session calls a tool whose server declares an interface
- **WHEN** the tool's result arrives
- **THEN** the interface renders inline under that tool call

#### Scenario: An app pops out into the side pane

- **GIVEN** an app is rendered inline under a tool call
- **WHEN** the reader pops it out
- **THEN** the app opens in the side pane

### Requirement: An app runs in a sandboxed frame it cannot break out of

The console SHALL render each app in a sandboxed frame that cannot read the console's cookies, storage or messages, and SHALL accept messages only from the frame it created.

#### Scenario: An app cannot read the console's storage

- **GIVEN** an app is rendered
- **WHEN** the app reads the console's cookies or storage
- **THEN** it reads nothing from the console

#### Scenario: Messages from another frame are ignored

- **GIVEN** an app is rendered in the console's frame
- **WHEN** a message arrives from a frame the console did not create
- **THEN** the console ignores the message

### Requirement: An app's tool calls ask permission like the agent's own

The console SHALL route an app's tool calls through the same permission card that the agent's own tool calls use.

#### Scenario: An app's tool call asks permission

- **GIVEN** an app is rendered
- **WHEN** the app calls a tool that needs approval
- **THEN** the permission card appears as it does for the agent's own call

#### Scenario: A denied app call does not run

- **GIVEN** an app's tool call is waiting on the permission card
- **WHEN** the reader denies it
- **THEN** the tool does not run

### Requirement: An app that cannot be read or throws shows a card and leaves the session unchanged

The console SHALL show an app that cannot be read or that throws as a card naming its server and the reason, and SHALL leave the session running.

#### Scenario: An unreadable app shows a card

- **GIVEN** the session calls a tool whose declared interface cannot be read
- **WHEN** the tool's result arrives
- **THEN** a card names the server and the reason
- **AND** the session carries on unchanged

#### Scenario: An app that throws shows the same card

- **GIVEN** an app is rendered inline
- **WHEN** the app throws an error
- **THEN** a card names the server and the reason
- **AND** the session carries on unchanged

### Requirement: A first-party view shows in any theme from one registry entry

The console SHALL show each first-party view the reader has open in every theme from that view's one registry entry.

#### Scenario: An open view stays through a theme change

- **GIVEN** the reader has a first-party view open
- **WHEN** the reader switches theme
- **THEN** the view is still shown
