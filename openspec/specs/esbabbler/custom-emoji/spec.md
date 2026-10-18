## Purpose

Per-room uploaded emoji — the room-owned blob, the count cap that bounds it, the id-keyed reaction tag, and the content node that resolves to an image on render.

## Requirements

### Requirement: Members with permission can add room emoji that everyone in the room can use

A member with permission to manage emoji SHALL be able to add a custom emoji that every member of the room can then use.

#### Scenario: Adding from the emoji picker

- **GIVEN** the member has permission to manage emoji
- **WHEN** they open the emoji picker and choose Add Emoji in its footer
- **THEN** the Add Emoji dialog opens
- **AND** once created, the emoji appears in the room's category of the picker for every member

#### Scenario: Member without permission sees no Add Emoji

- **GIVEN** the member does not have permission to manage emoji
- **WHEN** they open the emoji picker
- **THEN** no Add Emoji action is shown

#### Scenario: Typing a colon suggests a room emoji

- **GIVEN** a room has a custom emoji named party
- **WHEN** a member types a colon followed by pa in the composer
- **THEN** the composer suggests the party emoji

### Requirement: Adding happens from the picker, and room settings manage the existing set

Adding a custom emoji SHALL be offered from the emoji picker's footer, and the room settings SHALL list, rename and delete existing custom emoji without offering to add one.

#### Scenario: Settings panel has no add action

- **GIVEN** a manager opens the emoji panel in room settings
- **WHEN** the panel is shown
- **THEN** the panel lists the room's custom emoji with rename and delete actions
- **AND** it offers no action to add a new emoji

#### Scenario: Empty settings panel points to the picker

- **GIVEN** the room has no custom emoji
- **WHEN** a manager opens the emoji panel in room settings
- **THEN** the panel's empty state tells them to add emoji from the emoji picker

### Requirement: A custom emoji name uses only lowercase letters, digits and underscores

A custom emoji's name SHALL use only lowercase letters, digits and underscores, and SHALL be unique within its room.

#### Scenario: Name with other characters is refused

- **GIVEN** a member is naming a custom emoji
- **WHEN** they enter a name containing a capital letter or a symbol
- **THEN** the name is refused

#### Scenario: Duplicate name is refused

- **GIVEN** the room already has a custom emoji named party
- **WHEN** a member creates another emoji named party
- **THEN** the creation is refused

#### Scenario: Pasted colons are dropped

- **GIVEN** a member is naming a custom emoji
- **WHEN** they paste the shortcode of an emoji wrapped in colons into the name field
- **THEN** the colons are dropped and the name reads party

### Requirement: A custom emoji cannot take a standard emoji's name

A custom emoji SHALL NOT take a name that a standard emoji already uses.

#### Scenario: Standard name is refused at creation

- **GIVEN** a standard emoji is named thumbs_up
- **WHEN** a member creates a custom emoji named thumbs_up
- **THEN** the creation is refused

#### Scenario: Later standard emoji shares a name with a room emoji

- **GIVEN** a room's custom emoji is named fire
- **WHEN** a later emoji standard adds an emoji named fire
- **THEN** existing reactions and messages still show the room's emoji
- **AND** only searching and completing by the name becomes ambiguous until the room renames it

### Requirement: A room holds no more custom emoji than its fixed cap

A room SHALL hold no more custom emoji than a fixed cap, and concurrent uploads SHALL NOT exceed that cap.

#### Scenario: Full room refuses a new upload

- **GIVEN** the room has reached its cap of custom emoji
- **WHEN** a member starts an upload for a new emoji
- **THEN** the upload is refused before any image is stored

#### Scenario: Two uploads race for the last place

- **GIVEN** the room has one place left under its cap
- **WHEN** two members create emoji at the same moment
- **THEN** only one of them is created

### Requirement: A custom emoji image has a size cap checked on the stored file

A custom emoji image SHALL NOT exceed the per-file size limit, and the limit SHALL be checked against the stored file.

#### Scenario: Oversized image is rejected and nothing is stored

- **GIVEN** a member uploads an image larger than the per-file limit
- **WHEN** the creation completes
- **THEN** the creation is refused
- **AND** no custom emoji is stored

### Requirement: Reactions and messages keep working when an emoji is renamed

A reaction or a message that uses a custom emoji SHALL keep showing that emoji after the emoji is renamed.

#### Scenario: Renamed emoji stays on existing reactions

- **GIVEN** members have reacted with a custom emoji and it appears in messages
- **WHEN** a manager renames the emoji
- **THEN** every existing reaction and message still shows the emoji

### Requirement: A custom emoji in a message shows as an image

A custom emoji in a message SHALL display as its image while the emoji exists.

#### Scenario: Message shows the emoji image

- **GIVEN** a message contains a custom emoji
- **WHEN** the message is shown
- **THEN** the emoji appears as its image sized to the surrounding text

#### Scenario: Composer shows the shortcode while typing

- **GIVEN** a member is inserting a custom emoji into the composer
- **WHEN** the emoji is in the composer
- **THEN** the composer shows its shortcode rather than its image

### Requirement: A deleted custom emoji keeps its reactions counted and its messages readable

When a custom emoji is deleted, its reactions SHALL remain counted with a placeholder and its messages SHALL keep its shortcode.

#### Scenario: Reaction to a deleted emoji

- **GIVEN** members have reacted with a custom emoji that is then deleted
- **WHEN** the message is shown
- **THEN** the reaction still shows its count
- **AND** the reaction shows a placeholder in place of the emoji image

#### Scenario: Message using a deleted emoji

- **GIVEN** a message contains a custom emoji that is then deleted
- **WHEN** the message is shown
- **THEN** the emoji's shortcode is shown in its place
- **AND** the rest of the message renders normally

### Requirement: Deleting a custom emoji removes it from the room at once

Deleting a custom emoji SHALL remove it from the picker and completion for every member at once, and SHALL remove its image from storage afterwards.

#### Scenario: Deleted emoji disappears from the picker

- **GIVEN** a manager deletes a custom emoji
- **WHEN** members open the emoji picker or type its shortcode
- **THEN** the emoji is no longer offered

#### Scenario: Deleted emoji's image is removed afterwards

- **GIVEN** a custom emoji has been deleted
- **WHEN** the removal of its image completes
- **THEN** the image is no longer stored
