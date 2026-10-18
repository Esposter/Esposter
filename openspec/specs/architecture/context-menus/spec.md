## Purpose

One context menu for everything on screen with actions of its own — opened by right-click, long press or the keyboard, fed the same item list as the thing's overflow button, and mounted once for the whole app.

## Requirements

### Requirement: One context menu shows whichever item was opened

The app SHALL show one context menu at a time, listing the items of the thing the reader opened it on.

#### Scenario: A right-click elsewhere moves the open menu

- **GIVEN** a context menu is open over one row
- **WHEN** the reader right-clicks a different item
- **THEN** the menu moves to the new point
- **AND** it lists that item's actions

### Requirement: A reader opens the context menu by right-click, long press or keyboard

A reader SHALL open an item's context menu with a right-click, a long press on a touch screen, or the keyboard.

#### Scenario: A right-click opens the menu at the pointer

- **GIVEN** an item has actions of its own
- **WHEN** the reader right-clicks the item
- **THEN** the context menu opens at the pointer

#### Scenario: A long press opens the menu at the finger

- **GIVEN** the reader is on a touch screen
- **WHEN** the reader holds a finger on an item
- **THEN** the context menu opens at the finger
- **AND** the click raised when the finger lifts does nothing

#### Scenario: A finger that moves to scroll cancels the long press

- **GIVEN** the reader is holding a finger on an item
- **WHEN** the finger moves to scroll
- **THEN** no context menu opens

#### Scenario: The keyboard opens the menu at the item's corner

- **GIVEN** an item with actions has keyboard focus
- **WHEN** the reader presses Shift+F10 or the menu key
- **THEN** the context menu opens at the corner of the focused item

### Requirement: The browser's own menu stays where the app adds no items

The browser's own context menu SHALL remain available wherever the app offers no items, in text fields, and on links.

#### Scenario: A text field keeps the browser's menu

- **GIVEN** the reader is in a text field
- **WHEN** the reader right-clicks the field
- **THEN** the browser's menu appears with its copy and paste entries

#### Scenario: A link inside an item keeps the browser's menu

- **GIVEN** a link sits inside an item that has its own actions
- **WHEN** the reader right-clicks the link
- **THEN** the browser's menu appears instead of the app's

#### Scenario: Holding Shift keeps the browser's menu

- **GIVEN** the reader holds Shift
- **WHEN** the reader right-clicks an item that has actions
- **THEN** the browser's menu appears

### Requirement: A context menu offers the same items as the overflow button

A context menu SHALL offer the same items as the overflow button of the thing it opens on.

#### Scenario: A resource row's context menu matches its overflow menu

- **GIVEN** a resource row has an overflow button
- **WHEN** the reader opens the row's context menu
- **THEN** the menu's items are the same as the overflow button's items

### Requirement: Picking an item closes the menu before the item runs

Picking an item SHALL close the menu and return focus to the element it opened on before the item runs.

#### Scenario: An item that opens a dialog keeps the focus the dialog takes

- **GIVEN** a menu item opens a dialog
- **WHEN** the reader picks that item
- **THEN** the menu closes and focus returns to the element it opened on
- **AND** the dialog then takes focus

#### Scenario: Escape closes the menu and returns focus

- **GIVEN** a context menu is open
- **WHEN** the reader presses Escape
- **THEN** the menu closes
- **AND** focus returns to the element it opened on

#### Scenario: Clicking away closes the menu without running an item

- **GIVEN** a context menu is open
- **WHEN** the reader clicks outside the menu
- **THEN** the menu closes
- **AND** no item runs

### Requirement: The context menu follows the library menu's keyboard contract

The context menu SHALL follow the keyboard contract of the library's menu, with focus on its first item as it opens.

#### Scenario: Focus lands on the first item as the menu opens

- **GIVEN** the reader opened the menu with the keyboard
- **WHEN** the menu appears
- **THEN** focus is on its first item

#### Scenario: Tab closes the menu

- **GIVEN** a context menu is open
- **WHEN** the reader presses Tab
- **THEN** the menu closes

### Requirement: Groups are set apart and destructive items are marked in the error colour

Groups of items in a context menu SHALL be set apart by a separator, and a destructive item SHALL be drawn in the error colour.

#### Scenario: A group begins after a separator

- **GIVEN** a menu has a second group of items
- **WHEN** the menu is shown
- **THEN** a separator sits between the groups

#### Scenario: A destructive item is drawn in the error colour

- **GIVEN** a menu lists a destructive item
- **WHEN** the menu is shown
- **THEN** the destructive item is drawn in the error colour
