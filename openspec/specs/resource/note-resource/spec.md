## Purpose

A rich-text document resource type on the existing Tiptap dependency — a Tiptap editor blade, JSON at rest, and a publishable read view rendered through generateHTML. Its tables hold plain text, and merged cells, formulas or typed values belong to a Sheet.

## Requirements

### Requirement: A note is created with a name and written in an editor

The owner SHALL be able to create a note from a name alone and write it in an editor with headings, lists, quotes, code, links and inline formatting.

#### Scenario: Creating a note needs only a name

- **GIVEN** the owner chooses the Note type
- **WHEN** they enter a name and create it
- **THEN** a note opens in the editor with an empty document

#### Scenario: Formatting from the menu bar

- **GIVEN** the owner is writing in a note
- **WHEN** they choose bold, italic, inline code, a heading, a bullet list or a quote
- **THEN** the chosen format applies to the text

### Requirement: Edits to a note are saved as they are made

The note SHALL save its content as the owner edits it, without a separate save step.

#### Scenario: A typed change is saved

- **GIVEN** the owner has typed text in a note
- **WHEN** the autosave interval passes
- **THEN** the note saves the change

#### Scenario: Reopening a note shows its latest content

- **GIVEN** the owner saved changes to a note
- **WHEN** they reopen it
- **THEN** the changes are there

### Requirement: Task lists can be written, ticked and nested

The note SHALL let the owner write task lists, tick and untick tasks, and nest sub-tasks under a task.

#### Scenario: Typing an opening bracket starts a task list

- **GIVEN** the owner is at the start of a line
- **WHEN** they type an empty bracket pair followed by a space
- **THEN** the line becomes a task

#### Scenario: Ctrl+Shift+9 starts a task list

- **GIVEN** the owner is writing a line
- **WHEN** they press Ctrl+Shift+9
- **THEN** the line becomes a task

#### Scenario: Ticking a task saves the change

- **GIVEN** a task is unticked
- **WHEN** the owner ticks it
- **THEN** the task shows as ticked
- **AND** the change is autosaved

#### Scenario: A task can hold sub-tasks

- **GIVEN** the owner is writing a task
- **WHEN** they indent a new task under it
- **THEN** the new task is a sub-task of the first

### Requirement: Tables hold plain text with rows, columns and headers

The note SHALL let the owner insert a table with a header row, change its rows and columns, and toggle its header, and SHALL keep table cells as plain text.

#### Scenario: Inserting a table gives a three by three grid with a header

- **GIVEN** the owner chooses Table in the menu bar
- **WHEN** the table is inserted
- **THEN** it has three rows and three columns with a header row

#### Scenario: Adding a row to a table

- **GIVEN** the caret is in a table
- **WHEN** the owner adds a row
- **THEN** a row is inserted in the table

#### Scenario: Table cells hold text only

- **GIVEN** the owner is editing a table cell
- **WHEN** they try to enter a formula
- **THEN** the cell keeps it as plain text

### Requirement: A published note reads as formatted text with tasks shown but not changeable

The public view of a published note SHALL show the note's formatting, with its tasks ticked as the owner left them, and SHALL NOT let a viewer change a tick.

#### Scenario: A viewer sees the ticks but cannot change them

- **GIVEN** a published note has a ticked task
- **WHEN** a viewer opens its public view
- **THEN** the task shows as ticked
- **AND** clicking it does not change it

#### Scenario: Scripts in a note do not run in the public view

- **GIVEN** a note contains script markup
- **WHEN** a viewer opens its public view
- **THEN** the script does not run

### Requirement: A note can be published and unpublished

The owner SHALL be able to publish a note to a public page and to unpublish it.

#### Scenario: Publishing a note makes it viewable

- **GIVEN** the owner has a note
- **WHEN** they publish it
- **THEN** the note is viewable at its public address

#### Scenario: Unpublishing a note removes the public page

- **GIVEN** a note is published
- **WHEN** the owner unpublishes it
- **THEN** its public address no longer shows the note

### Requirement: The editor shows the note's word and character counts

The Note editor SHALL show the number of words and characters in the note under the document, and while text is selected, the number in the selection.

#### Scenario: The line shows the note's counts

- **GIVEN** a note whose text is two words in one paragraph and one word in the next
- **WHEN** the owner opens the note
- **THEN** the line reads three words
- **AND** it reads the characters of the three words

#### Scenario: A selection shows its own counts

- **GIVEN** a note of three words with the first word selected
- **WHEN** the selection changes
- **THEN** the line reads one word and that word's characters
- **AND** clearing the selection returns the line to the note's counts

#### Scenario: A language written without spaces counts by its words

- **GIVEN** a note whose text is one sentence of Japanese
- **WHEN** the line is drawn
- **THEN** it counts the sentence's words as the runtime segments them, not as one word

#### Scenario: A paragraph break separates two words

- **GIVEN** a note whose first paragraph ends in a word and whose second begins with one
- **WHEN** the line is drawn
- **THEN** the two words are counted as two
