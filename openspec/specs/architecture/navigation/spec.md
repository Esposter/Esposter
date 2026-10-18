## Purpose

How links and navigation work app-wide — NuxtLink/navigateTo for everything, never a raw anchor.

## Requirements

### Requirement: Every in-app link is a router link

Every link in the app SHALL navigate through the client-side router, and a plain anchor element SHALL NOT be written.

#### Scenario: A developer writes a plain anchor

- **GIVEN** a component contains a plain anchor element
- **WHEN** the lint check runs
- **THEN** the lint check fails and the anchor is not shipped

#### Scenario: A link targets an app route

- **GIVEN** a reader sees a link to a page in the app
- **WHEN** the reader activates the link
- **THEN** the page changes without a full reload of the app
- **AND** middle-click and ctrl-click open the page in a new tab

### Requirement: External links open in a new tab without a handle back

An external link SHALL open in a new tab, and the page it opens SHALL have no access to the page that opened it.

#### Scenario: A reader activates an external link

- **GIVEN** a link points to a URL outside the app
- **WHEN** the reader activates it
- **THEN** the URL opens in a new tab
- **AND** the new page cannot reach the page the reader came from

### Requirement: An in-page anchor scrolls without adding history

An in-page anchor SHALL scroll to its target without adding an entry to the browser history.

#### Scenario: A reader activates an in-page anchor

- **GIVEN** a table of contents links to a heading on the same page
- **WHEN** the reader activates the link
- **THEN** the page scrolls so the heading sits clear of the sticky app bar
- **AND** the browser's back button does not step through the anchor

#### Scenario: A script scrolls to an anchor by hand

- **GIVEN** an anchor is clicked
- **WHEN** the page handles the click
- **THEN** the address bar and the router agree on the current hash

### Requirement: Code-triggered navigation goes through the navigation function

A navigation that code starts rather than a click SHALL go through the app's single navigation function.

#### Scenario: A save completes and the page redirects

- **GIVEN** a form submit or a mutation finishes successfully
- **WHEN** the app moves the reader to another page
- **THEN** the navigation replaces the current history entry

#### Scenario: Code pushes a route directly

- **GIVEN** code attempts to push a route through the router directly
- **WHEN** the lint check runs
- **THEN** the lint check fails and asks for the navigation function instead

### Requirement: A control with no destination is not a link

A control that only emits an event SHALL NOT present itself as a link.

#### Scenario: A link-styled control only handles a click

- **GIVEN** a control looks like a link but has no destination
- **WHEN** a reader moves focus through the page
- **THEN** the control is not announced as a link
- **AND** activating it runs its action without changing the address

### Requirement: Drill-down trail is recorded on the history entry

The trail of a drill-down SHALL be recorded once, on the history entry of each navigation, rather than by each link that starts it.

#### Scenario: A reader drills down through several pages

- **GIVEN** a reader moves through a chain of drill-down pages
- **WHEN** the reader presses back
- **THEN** the trail the earlier entry recorded is restored

#### Scenario: A new link joins the drill-down

- **GIVEN** a new link is added that starts a drill-down
- **WHEN** the reader follows it
- **THEN** the trail is still recorded without the link setting it

### Requirement: View state lives in the address and preferences in storage

Navigation state that identifies the page being shown SHALL live in the address, and a reader's personal preference SHALL live in browser storage.

#### Scenario: Two people open the same filtered view

- **GIVEN** a reader copies the address of a page showing a filter
- **WHEN** a second person opens that address
- **THEN** the second person sees the same filtered view

#### Scenario: A reader collapses a rail and returns later

- **GIVEN** a reader has collapsed a side rail
- **WHEN** the reader opens the app again in a later session
- **THEN** the rail is still collapsed
