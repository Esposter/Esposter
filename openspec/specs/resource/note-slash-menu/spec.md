## Purpose

Typing "/" in a Note opens a filterable menu of blocks (text, headings, lists, task list, quote, code, divider) at the caret, drawn by the editor on the suggestion stack the message composer runs. The menu runs the same command as the menu bar, and the message composer keeps its own slash commands.

## Requirements

### Requirement: Typing a slash in a note opens the block menu at the caret

The Note editor SHALL open a menu of blocks when the author types a slash at the start of a line or after a space.

#### Scenario: A slash at the start of a line opens the menu

- **GIVEN** the author is on an empty line in a note
- **WHEN** they type a slash
- **THEN** a block menu opens at the caret

#### Scenario: A slash after a space opens the menu

- **GIVEN** the author has typed a word in a note
- **WHEN** they type a space and then a slash
- **THEN** the block menu opens at the caret

#### Scenario: A slash in the middle of a word does not open the menu

- **GIVEN** the author is in the middle of a word
- **WHEN** they type a slash
- **THEN** no block menu opens

### Requirement: The menu filters by typed text, including aliases

The block menu SHALL filter its items by their titles and by the short aliases an author types.

#### Scenario: Typing part of a title narrows the list

- **GIVEN** the block menu is open
- **WHEN** the author types "head"
- **THEN** only the heading items remain

#### Scenario: An alias finds its block

- **GIVEN** the block menu is open
- **WHEN** the author types "todo"
- **THEN** the Task List item is listed

#### Scenario: A divider is found by its alias

- **GIVEN** the block menu is open
- **WHEN** the author types "hr"
- **THEN** the Divider item is listed

### Requirement: Choosing a menu item converts the line and removes the typed slash

The block menu SHALL remove the typed slash command and then apply the chosen block to the line.

#### Scenario: Choosing a heading removes the slash text

- **GIVEN** the author has typed "/h1" on a line
- **WHEN** they choose Heading 1
- **THEN** the typed "/h1" is removed
- **AND** the line becomes a first-level heading

#### Scenario: Choosing an item with the mouse does the same

- **GIVEN** the block menu is open
- **WHEN** the author clicks an item
- **THEN** the item is applied to the line as it would be from the keyboard

### Requirement: The menu lists the blocks in the menu bar's order

The block menu SHALL list its items in the same order the menu bar uses.

#### Scenario: The order matches the menu bar

- **GIVEN** the author opens the block menu
- **WHEN** they read the items
- **THEN** the items appear in the order: paragraph, headings, task list, quote, lists, code block, divider

### Requirement: The menu offers the block set and no embeds

The block menu SHALL offer text, headings, task list, quote, lists, code block and divider, and SHALL NOT offer tables, images or pages.

#### Scenario: Embed items are absent

- **GIVEN** the author types a slash to open the menu
- **WHEN** they look for table, image or page items
- **THEN** none are offered

### Requirement: The message composer keeps its own slash commands

The message composer SHALL NOT open the block menu when its author types a slash.

#### Scenario: A slash in a message opens message commands

- **GIVEN** the author is writing a message
- **WHEN** they type a slash
- **THEN** the message slash commands open, not the block menu
