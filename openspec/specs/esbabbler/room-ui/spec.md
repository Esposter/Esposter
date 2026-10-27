## Purpose

Room-shell polish — role-grouped member list, resizable sidebars, message density, empty states, one room header at every width, category drag-reorder. The room looks and is arranged as one cohesive surface, with visual preferences kept on the device and category order kept for everyone.

## Requirements

### Requirement: The member list groups members under their highest role

The member list SHALL group members under their highest role, in role order, with members who hold no role listed together in a Members group.

#### Scenario: members with different roles

- **GIVEN** members holding several roles and members holding none
- **WHEN** a reader views the member list
- **THEN** each role's members are listed under that role, highest role first
- **AND** members with no role are listed under Members at the end

#### Scenario: the everyone role does not form a group

- **GIVEN** a member whose only role is the everyone role
- **WHEN** a reader views the member list
- **THEN** the member is listed under Members

### Requirement: A group's count is the total number of its members

Each member group's count SHALL show the group's total members in the room, not only the members loaded so far.

#### Scenario: the reader has scrolled only part of the list

- **GIVEN** a room whose list has loaded only some of its members
- **WHEN** the reader views the group counts
- **THEN** each count shows the group's total in the room

#### Scenario: a member with a role leaves the room

- **GIVEN** a member whose highest role's group shows a count
- **WHEN** that member leaves the room
- **THEN** that group's count goes down by one

### Requirement: A departure or a role change keeps every role group count exact

A member's departure or role change SHALL, once the room's counts have been re-read after it, leave each role group's count equal to the members holding that role and the roleless count non-negative, whether or not the member's roles were loaded. Until that re-read settles, the counts SHALL show the last settled read.

#### Scenario: a leave from an unloaded page keeps every group count equal to its members

- **GIVEN** a room of 2 members who both hold the Admin role, with neither member's roles loaded
- **WHEN** one of them leaves
- **THEN** the Admin group count is 1
- **AND** the roleless count is 0

#### Scenario: a failed re-read keeps the last settled counts

- **GIVEN** a room of 2 members who both hold the Admin role, whose counts were read before either left
- **WHEN** one of them leaves and the re-read of the counts fails
- **THEN** the Admin group count is still 2
- **AND** the counts are read again, and the Admin group count becomes 1 once a read settles

#### Scenario: a role change for a member outside the loaded pages keeps every group count equal to its members

- **GIVEN** a room of 1 member who holds the Admin role, with the member's roles not loaded
- **WHEN** the member's role changes to Moderator
- **THEN** the Admin group count is 0
- **AND** the Moderator group count is 1

### Requirement: A member's name takes the colour of their highest role

A member's name SHALL be shown in the colour of their highest role.

#### Scenario: a member with a coloured role

- **GIVEN** a member whose highest role has a colour
- **WHEN** the member's name is shown in the member list
- **THEN** the name is shown in that colour

### Requirement: The rooms sidebar and the right drawer resize within limits and keep their width

The rooms sidebar and the right drawer SHALL resize by dragging their inner edge within fixed minimum and maximum widths, and SHALL keep the chosen width on this device.

#### Scenario: a reader drags a sidebar edge past its limit

- **GIVEN** a reader dragging a sidebar's inner edge
- **WHEN** the drag goes past the minimum or maximum width
- **THEN** the sidebar stops at that limit

#### Scenario: a reader reopens the app

- **GIVEN** a sidebar the reader has resized
- **WHEN** the reader reloads the app
- **THEN** the sidebar keeps the chosen width

#### Scenario: a reader resizes a sidebar from the keyboard

- **GIVEN** a sidebar's resize edge focused by keyboard
- **WHEN** the reader presses the arrow keys
- **THEN** the sidebar resizes in steps

#### Scenario: a reader on a phone

- **GIVEN** a reader on a phone
- **WHEN** the reader views the room
- **THEN** no resize edge is shown on the drawers

### Requirement: Message display offers cozy and compact densities

Message display SHALL offer a cozy and a compact density, and compact SHALL reduce the spacing between messages, kept on this device.

#### Scenario: a reader chooses compact

- **GIVEN** a reader in the appearance settings
- **WHEN** the reader chooses compact message display
- **THEN** the spacing between message batches and each message is reduced
- **AND** the choice is kept when the reader reloads the app

### Requirement: An empty list says why it is empty and what would change that

Every list with nothing to show SHALL show a title and a line explaining how it would fill.

#### Scenario: a reader with no rooms

- **GIVEN** a reader who belongs to no rooms
- **WHEN** the reader views the room list
- **THEN** it shows that there are no rooms yet and how to create or join one

#### Scenario: a search with no results

- **GIVEN** a message search that matches nothing
- **WHEN** the reader views the results
- **THEN** it shows that there are no results and a hint to change the keywords or filters

### Requirement: The room header offers the same controls at every width

The room header SHALL offer the same controls on a phone as on a desktop, and SHALL NOT show a second row of buttons above the composer.

#### Scenario: a reader on a phone

- **GIVEN** a reader on a phone with the room list closed
- **WHEN** the reader views the room
- **THEN** the header shows a control that opens the room list
- **AND** the header shows the call, search and member list controls and the room's overflow menu

#### Scenario: the overflow menu

- **GIVEN** a reader opening the room's overflow menu
- **WHEN** the reader chooses Pinned Messages
- **THEN** the pinned messages open in the side panel
- **AND** the menu shows the reader's notification level as a selected radio choice

### Requirement: Room categories reorder by drag or by keyboard and the order is kept for everyone

Room categories SHALL reorder by dragging their headers or with the alt and arrow keys, and the new order SHALL persist for every member of the room.

#### Scenario: a member drags a category to the top

- **GIVEN** a member with the category headers in view
- **WHEN** the member drags a category above the others
- **THEN** the new order shows at once
- **AND** every member of the room sees the new order

#### Scenario: a member moves a category with the keyboard

- **GIVEN** a category header focused by keyboard
- **WHEN** the member presses alt and the down arrow
- **THEN** the category moves down one place

#### Scenario: a reorder is refused

- **GIVEN** a member dragging a category
- **WHEN** saving the new order fails
- **THEN** the whole change is rolled back and the previous order is shown

#### Scenario: a new category

- **GIVEN** a room with existing categories
- **WHEN** a member creates a category
- **THEN** the new category is placed below the existing ones
