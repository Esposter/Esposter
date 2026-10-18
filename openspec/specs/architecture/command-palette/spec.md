## Purpose

One palette on every page, opened by Ctrl+K, and one registry of commands behind it — each surface registers what it can do while it is mounted, its shortcuts bound for exactly that long, its own search handed to the palette as a scope, and the shortcuts dialog listing every key that works.

## Requirements

### Requirement: Palette opens from every page

The command palette SHALL open from every page with Ctrl+K and offer what the page in front of the reader can reach or do.

#### Scenario: Palette opens on a page with no search of its own

- **GIVEN** the reader is on any page of the app
- **WHEN** the reader presses Ctrl+K
- **THEN** the palette opens over the page
- **AND** it offers the commands that page makes available

#### Scenario: Palette opens while a text field has focus

- **GIVEN** the reader is typing in a text field
- **WHEN** the reader presses Ctrl+K
- **THEN** the palette opens instead of the keystroke reaching the field

### Requirement: Commands are offered only while their surface is on screen

A surface's commands SHALL be offered, and their shortcuts active, only while that surface is mounted.

#### Scenario: Leaving a surface removes its commands

- **GIVEN** a page has registered its commands and shortcuts
- **WHEN** the reader navigates away from that page
- **THEN** its commands are no longer offered by the palette
- **AND** its shortcuts are no longer listed in the shortcuts dialog

#### Scenario: A command that applies only in one state is hidden otherwise

- **GIVEN** a sheet has no cells selected
- **WHEN** the reader opens the palette
- **THEN** the cell commands are not offered

#### Scenario: A command that applies in a state is offered while the state holds

- **GIVEN** a sheet has cells selected
- **WHEN** the reader opens the palette
- **THEN** the cell commands are offered

### Requirement: Every listed shortcut does what it names

Every shortcut the shortcuts dialog lists SHALL do what it names while its surface is on screen, and a shortcut that cannot be bound SHALL fail the test run.

#### Scenario: A listed key runs its command

- **GIVEN** the shortcuts dialog lists a command's key under a surface on screen
- **WHEN** the reader presses that key
- **THEN** the command runs

#### Scenario: A shortcut that cannot be bound fails the run

- **GIVEN** a shortcut is written in the source of the app
- **WHEN** the shortcut cannot be bound
- **THEN** the test run fails rather than listing a key that does nothing

### Requirement: Shortcuts do not fire while a field has focus

A command shortcut SHALL NOT fire while a text field has focus, so its keys reach the field as typing.

#### Scenario: A shortcut key is typed into a focused field

- **GIVEN** a text field has focus
- **WHEN** the reader presses a key that is a shortcut elsewhere on the page
- **THEN** the key is typed into the field
- **AND** no command runs

#### Scenario: A key sequence works like a single key

- **GIVEN** the resource explorer is on screen
- **WHEN** the reader presses G and then A
- **THEN** the command bound to that sequence runs

### Requirement: App-wide commands agree with the dock's menus

The app-wide commands SHALL be the same entries the dock's theme, style and account menus show, so the palette and those menus never disagree.

#### Scenario: Choices are listed whole with the chosen one marked

- **GIVEN** the reader has one design style selected
- **WHEN** the reader opens the palette and looks under the style heading
- **THEN** every design style is listed
- **AND** the selected style is marked

#### Scenario: An entry that needs an account follows the reader's sign-in

- **GIVEN** the reader signed in after the page loaded
- **WHEN** the reader next opens the palette
- **THEN** the entries that need a signed-in reader are offered

### Requirement: A surface's search opens the palette in its scope

A surface that has its own search SHALL open the palette in that search's scope, and Backspace on an empty query SHALL step the palette out to the whole app.

#### Scenario: Ctrl+K beside a room search searches the rooms

- **GIVEN** the reader is on the messages page, whose room search is open
- **WHEN** the reader presses Ctrl+K
- **THEN** the palette searches the reader's rooms

#### Scenario: Backspace on an empty query leaves the scope

- **GIVEN** the palette is searching a surface's scope and its query is empty
- **WHEN** the reader presses Backspace
- **THEN** the palette searches every command offered by the app

### Requirement: Palette search finds commands by title and groups the results

The palette SHALL search every offered command by its title and keep the matches of each surface together under that surface's heading.

#### Scenario: A typed query returns grouped matches

- **GIVEN** several surfaces offer commands
- **WHEN** the reader types a word into the palette
- **THEN** the matching commands appear
- **AND** each command appears under the heading of the surface that offers it

### Requirement: The shortcuts dialog lists every key that works

The shortcuts dialog SHALL list every registered shortcut, grouped by the surface that registered it.

#### Scenario: Opening the dialog lists shortcuts by surface

- **GIVEN** several surfaces are on screen
- **WHEN** the reader presses Shift+?
- **THEN** the shortcuts dialog lists each shortcut under the surface that registered it

#### Scenario: A key the surface handles itself is still listed

- **GIVEN** the message composer is on screen
- **WHEN** the reader opens the shortcuts dialog
- **THEN** the composer's own keys, such as sending, are listed under the composer

### Requirement: Commands that go somewhere are real links

A command with a destination SHALL be a real link, so the reader can open it in a new tab.

#### Scenario: A link command opens in a new tab

- **GIVEN** the palette lists a command that goes to a page
- **WHEN** the reader opens that command in a new tab
- **THEN** the destination page opens in the new tab

### Requirement: The palette keeps its field in place while the list changes

The palette SHALL stay high on the screen so its search field does not move when the list changes length.

#### Scenario: A shrinking list leaves the field where it was

- **GIVEN** the palette is open with many results
- **WHEN** the reader types a query that leaves only a few results
- **THEN** the search field stays where it was on the screen
