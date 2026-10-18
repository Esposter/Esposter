## ADDED Requirements

### Requirement: The note's overflow menu offers the Markdown commands

The overflow menu of a note SHALL offer Import Markdown and Export Markdown beside the other portable commands.

#### Scenario: The overflow menu lists the Markdown commands

- **GIVEN** an owner viewing a note's resource page
- **WHEN** the owner opens the overflow menu
- **THEN** the menu lists Import Markdown and Export Markdown

### Requirement: Exporting a note downloads it as a Markdown file

Exporting a note SHALL download its content as a Markdown file named after the note.

#### Scenario: Exporting a note downloads a Markdown file

- **GIVEN** a note named Meeting with a heading and a bulleted list
- **WHEN** the owner chooses Export Markdown
- **THEN** a file named Meeting.md downloads
- **AND** the heading appears in the file as a Markdown heading
- **AND** the list items appear in the file as a Markdown list

### Requirement: A Markdown round trip keeps every block the note holds

A note exported to Markdown and imported again SHALL keep the same content, for every kind of block the note can hold.

#### Scenario: A note with every block survives a Markdown round trip

- **GIVEN** a note holding headings, lists, task lists, bold and italic text, links, a quote and a code block
- **WHEN** the owner exports the note and imports the file into the same note
- **THEN** the note's content is the same as before the export

### Requirement: An import shows what it will replace before it saves

Importing a Markdown file SHALL show the content it will replace and SHALL save nothing until the owner confirms.

#### Scenario: An import previews the content it will replace

- **GIVEN** a note with existing content
- **WHEN** the owner chooses Import Markdown and picks a file
- **THEN** a preview shows the imported content
- **AND** the note keeps its existing content until the owner confirms

#### Scenario: Cancelling an import keeps the note as it was

- **GIVEN** an import preview is open for a note
- **WHEN** the owner cancels the import
- **THEN** the note keeps its existing content

### Requirement: An import keeps the replaced content in version history

Confirming an import SHALL keep the note's previous content in its version history.

#### Scenario: An imported note keeps its previous content in history

- **GIVEN** a note with existing content
- **WHEN** the owner confirms an import of a Markdown file
- **THEN** the note shows the imported content
- **AND** the previous content can be restored from the note's version history
