## Purpose

What the agent console draws over its world. The Genshin world fills the page, one heads-up bar runs under it, and typing and reading happen in a console that opens above the bar on a key, as a game's chat does. Escape opens a pause menu. The latest replies show over the world and fade. The game's own startup screen covers the page until it can be used. Every panel is built from the UI library in the Genshin design style: the navy of the game's HUD, with the pause menu on the cream of its menus.

## Requirements

### Requirement: The world fills the page with one heads-up bar beneath it

The console page SHALL show the world filling the page, with one heads-up bar running along its foot beneath the world.

#### Scenario: The console page is open

- **GIVEN** the console page is open
- **WHEN** the page is shown
- **THEN** the world fills the page and the heads-up bar sits under it with the world above

#### Scenario: The bar shows the session's state

- **GIVEN** a session is open
- **WHEN** the bar is shown
- **THEN** it shows the session's title, state, context and cost, and the host's connection status

### Requirement: Keys open the console only while nothing else has focus

While nothing is open over the world and no field has focus, the T and Enter keys SHALL open the console with the composer focused.

#### Scenario: Opening the console from the world with T

- **GIVEN** nothing is open over the world
- **WHEN** the person presses T
- **THEN** the console opens with the composer focused

#### Scenario: A key typed into an editable field

- **GIVEN** an editable field has focus
- **WHEN** the person presses T
- **THEN** the key is typed into the field and the console does not open

#### Scenario: A key pressed with a modifier held

- **GIVEN** nothing is open over the world
- **WHEN** the person presses T with a modifier key held
- **THEN** the browser's own shortcut runs and the console does not open

### Requirement: Escape stops a turn, closes the console, or opens the pause menu

Escape SHALL do the one thing the focused surface needs, and SHALL NOT leave the page.

#### Scenario: Escape during a running turn in the console

- **GIVEN** the console is open and a turn is running
- **WHEN** the person presses Escape
- **THEN** the turn is stopped and the console stays open

#### Scenario: Escape in the console with no turn running

- **GIVEN** the console is open and no turn is running
- **WHEN** the person presses Escape
- **THEN** the console closes

#### Scenario: Escape over the world

- **GIVEN** nothing is open over the world
- **WHEN** the person presses Escape
- **THEN** the pause menu opens

### Requirement: A permission request opens the console and stays flagged until answered

A pending permission request SHALL open the console on it and SHALL keep the bar's mark lit until it has a verdict.

#### Scenario: A permission request arrives while the console is closed

- **GIVEN** the console is closed
- **WHEN** a permission request arrives
- **THEN** the console opens on the request

#### Scenario: The request is answered

- **GIVEN** a pending permission request with its mark lit on the bar
- **WHEN** the person gives a verdict
- **THEN** the mark goes out

### Requirement: The latest reply shows over the world and fades

With the console closed, each new reply's opening words SHALL show at the foot of the world on one line and fade after a few seconds.

#### Scenario: A new reply with the console closed

- **GIVEN** the console is closed
- **WHEN** a new reply arrives
- **THEN** its opening words show over the world and then fade

#### Scenario: Clicking a line over the world

- **GIVEN** a reply line showing over the world
- **WHEN** the person clicks it
- **THEN** the console opens

#### Scenario: A diff or permission request arriving with the console closed

- **GIVEN** the console is closed
- **WHEN** a diff or a permission request arrives
- **THEN** the console opens rather than a line showing over the world

#### Scenario: A replayed log on connecting

- **GIVEN** a page connecting to a host with a log to replay
- **WHEN** the log is replayed
- **THEN** no reply lines show over the world

### Requirement: Unpairing clears the sessions and the console

Unpairing SHALL clear the sessions, the console and the pause menu along with the host, and the console SHALL ask for a host again.

#### Scenario: Unpairing the host

- **GIVEN** a paired host with open sessions
- **WHEN** the person unpairs it
- **THEN** the world is left empty and the console asks for a host again

### Requirement: The console sheet resizes without moving the world

The console sheet SHALL open at a height the reader can drag, and opening or closing it SHALL NOT resize the world.

#### Scenario: Dragging the console's top edge

- **GIVEN** the console is open
- **WHEN** the reader drags its top edge
- **THEN** the sheet takes the new height and the next opening reuses it

#### Scenario: Opening and closing the console

- **GIVEN** the world is in view
- **WHEN** the console opens and then closes
- **THEN** the world stays in the same place on the page

### Requirement: Open state survives a reload within the same tab

Whether the console is open, its tab, the session it shows and the composer's draft SHALL survive a reload within the same browser tab.

#### Scenario: Reloading the page with the console open

- **GIVEN** the console open on a tab with a draft in the composer
- **WHEN** the page is reloaded
- **THEN** the console reopens on the same tab with the draft still in the composer once the host replays the session

### Requirement: The game's opening and loading screen cover the page until it is usable

The page SHALL show the game's opening and then a loading screen covering the page, until the page, the world and any paired host are ready.

#### Scenario: Loading completes with a paired host

- **GIVEN** a paired host
- **WHEN** the page, the world and the host are all ready
- **THEN** the loading screen goes and does not return

#### Scenario: Loading with no host paired

- **GIVEN** no host is paired
- **WHEN** the page and the world are ready
- **THEN** the loading screen goes, the host step counting as done

#### Scenario: The world cannot start

- **GIVEN** the world fails to start
- **WHEN** the other steps finish
- **THEN** the loading screen still goes so the console is not held behind it

### Requirement: Until a host is paired, the console asks for one

Until a host is paired, the console SHALL show only a pairing panel in place of its tabs.

#### Scenario: Opening the console with no host paired

- **GIVEN** no host is paired
- **WHEN** the console is opened
- **THEN** only the pairing panel is shown

### Requirement: A connection line heads every tab

The console SHALL show a connection line above its tabs saying when the host is connecting, is not answering, or was stopped from its own window, with a Reconnect control.

#### Scenario: The host stops answering

- **GIVEN** a paired host
- **WHEN** it stops answering
- **THEN** the line says the host is not answering and Reconnect is offered

### Requirement: Replies render as sanitised markdown with copyable code

A reply SHALL render as sanitised markdown, and every code block SHALL carry its own copy control.

#### Scenario: Copying a code block from a reply

- **GIVEN** a reply containing a code block
- **WHEN** the person presses the block's copy control
- **THEN** the code block's text is copied

### Requirement: Tool calls collapse to a single row

Each tool call SHALL collapse to one row showing the tool, its target, how long it ran and whether it passed, with its output toggled on a click.

#### Scenario: Toggling a tool call's output

- **GIVEN** a collapsed tool call row
- **WHEN** the person clicks it
- **THEN** its output opens and a second click closes it

### Requirement: A working line shows what the turn is doing

While a turn runs, the console SHALL show a working line naming what the turn is doing and counting up from the prompt.

#### Scenario: A turn in progress with a current task

- **GIVEN** a turn that has a task in progress
- **WHEN** the working line is shown
- **THEN** it names that task and its elapsed time counts up

### Requirement: The pause menu holds the page's exits

The pause menu SHALL offer returning to the world, the sessions, unpairing, and leaving to the app.

#### Scenario: Leaving to the app from the pause menu

- **GIVEN** the pause menu is open
- **WHEN** the person chooses leave to the app
- **THEN** the page leaves to the app's home

### Requirement: The world loads only on the console page and after its first paint

The world SHALL load only on the console page, after that page's first paint.

#### Scenario: Another page of the app

- **GIVEN** any other page of the app
- **WHEN** it is loaded
- **THEN** the world's code is not loaded
