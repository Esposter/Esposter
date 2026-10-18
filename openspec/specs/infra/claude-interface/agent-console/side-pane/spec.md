## Purpose

The agent console's side pane, which opens any page of the app beside the conversation in a frame with the app's chrome dropped by an embed flag, so a link to a resource or a room opens there rather than in a new tab. The app's own layouts read the flag once and draw the page itself unchanged.

## Requirements

### Requirement: A link to a page of the app opens beside the conversation

A link in the conversation to a page of this app SHALL open in the side pane beside the console's tabs, unless the person holds a modifier key.

#### Scenario: Clicking a link to an app page

- **GIVEN** a reply in the conversation with a link to a page of this app
- **WHEN** the person clicks it
- **THEN** the page opens in the side pane

#### Scenario: Ctrl-clicking a link to an app page

- **GIVEN** a reply with a link to a page of this app
- **WHEN** the person holds Ctrl and clicks it
- **THEN** the page opens in a new browser tab

#### Scenario: A link to another site

- **GIVEN** a reply with a link to another site
- **WHEN** the person clicks it
- **THEN** the browser handles the link as it normally would

### Requirement: A framed page draws without the app's chrome and otherwise unchanged

A page shown in the side pane SHALL draw without the app's dock, drawers or trail, with its own content unchanged.

#### Scenario: A resource page shown in the pane

- **GIVEN** a resource page opened in the side pane
- **WHEN** it is drawn
- **THEN** the app's trail and service menu are not shown and its title is kept

### Requirement: Open pages stay loaded while their tab is in the background

Each open page in the side pane SHALL stay loaded while its tab is in the background, and keep its place when shown again.

#### Scenario: Switching away from a pane tab and back

- **GIVEN** a pane tab with a scrolled page
- **WHEN** the person switches to another tab and back
- **THEN** the page is still loaded at the same place

### Requirement: Only the conversation's links open in the pane

Links in tool results or shell output SHALL NOT open in the side pane.

#### Scenario: A link in a tool result

- **GIVEN** a tool result containing a link to an app page
- **WHEN** the person clicks it
- **THEN** the browser handles the link and the pane does not open it

### Requirement: The pane appears only while a page is open there

The side pane SHALL appear only while a page is open in it, and SHALL close when its last tab closes.

#### Scenario: Closing the last pane tab

- **GIVEN** one page open in the side pane
- **WHEN** its tab is closed
- **THEN** the side pane closes

### Requirement: The pane never leaves the console's tabs narrower than their least width

The side pane SHALL leave the console's tabs at least their least width, whatever width was remembered.

#### Scenario: A remembered width from a wider window

- **GIVEN** a pane width remembered on a wider window
- **WHEN** the console opens in a narrower window
- **THEN** the pane is narrowed so the console's tabs keep their least width

### Requirement: Open pages do not survive a reload, the pane's width does

The open pages in the side pane SHALL NOT survive a reload, while the pane's width SHALL be remembered.

#### Scenario: Reloading with pages open in the pane

- **GIVEN** pages open in the side pane with a set width
- **WHEN** the page is reloaded
- **THEN** no pages are open and the pane keeps its remembered width

### Requirement: Navigation inside a framed page stays in the frame

A page framed in the side pane that links elsewhere in the app SHALL navigate inside the frame.

#### Scenario: Following a link inside a framed page

- **GIVEN** a page open in the side pane
- **WHEN** it links to another page of the app
- **THEN** the navigation happens inside the frame
