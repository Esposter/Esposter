## Purpose

A click lands on exactly one thing — a link or control inside something that opens on a click acts alone, links in user content open a new tab with no handle back, and the browser's own menu stays over a link.

## Requirements

### Requirement: A control inside a clickable container acts alone

A click on a link, button, field or dialog inside something that opens on a click SHALL act on that inner control alone, and the container SHALL NOT open.

#### Scenario: A reader clicks a link in a todo's notes

- **GIVEN** a todo's detail is opened from its row
- **WHEN** the reader clicks a link in the notes
- **THEN** the link opens in a new tab
- **AND** the todo's dialog does not open over it

#### Scenario: A reader clicks a selection checkbox in a table row

- **GIVEN** a table row opens when it is clicked
- **WHEN** the reader clicks the row's selection checkbox
- **THEN** only the selection changes

#### Scenario: A reader clicks the plain padding of a container

- **GIVEN** a table row or dashboard tile opens when it is clicked
- **WHEN** the reader clicks an area with no control in it
- **THEN** the container opens

### Requirement: Ending a text selection is not a click

Releasing the pointer after dragging to select text SHALL NOT open the element the pointer is released on.

#### Scenario: A reader drags across a row's text to copy it

- **GIVEN** a reader drags across the text of a clickable row
- **WHEN** the reader releases the pointer on the row while the text stays selected
- **THEN** nothing opens

### Requirement: Links in user content open a new tab with no handle back

A link inside user-written content SHALL open in a new tab that has no access to the page it came from, whatever relation the author wrote on the link.

#### Scenario: An author writes an opener relation on a link

- **GIVEN** an author's content contains a link with an opener relation
- **WHEN** a reader activates the link
- **THEN** the link opens in a new tab
- **AND** the new tab cannot redirect the page it came from

### Requirement: The browser's menu stays over a link

A right-click or long press on a link SHALL show the browser's own menu, even inside an element that has a context menu of its own.

#### Scenario: A reader right-clicks a link inside a menu-bearing element

- **GIVEN** a link sits inside an element with its own context menu
- **WHEN** the reader right-clicks the link
- **THEN** the browser's menu appears with the options to open the link in a new tab and to copy its address

### Requirement: A preview is one target

A message shown as a preview SHALL be one target that opens the message, and a link inside the preview SHALL NOT be a second target.

#### Scenario: A reader clicks a search result that contains a link

- **GIVEN** a search result preview contains a link
- **WHEN** the reader clicks the preview
- **THEN** the message opens
- **AND** the link inside the preview is not activated
