## ADDED Requirements

### Requirement: Forms are filled and kept on save

The package SHALL render a document's form fields as inputs on their pages and write every filled value into the bytes a save produces.

#### Scenario: Filling a form and downloading it

- **GIVEN** a document with a text field on its first page
- **WHEN** the reader types into the field and downloads the document
- **THEN** the downloaded bytes hold the typed value in that field

### Requirement: Annotation editing is a mode with change events

The package SHALL set the renderer's annotation editor mode to none, free text, ink, highlight or stamp, and report every change to the document's annotations as an event naming its page.

#### Scenario: Switching the editor mode

- **GIVEN** a document open in the viewer
- **WHEN** the consumer sets the mode to ink
- **THEN** a drag on a page draws an ink annotation
- **AND** setting the mode to none stops a drag from drawing

#### Scenario: Drawing reports a change

- **GIVEN** the editor mode is ink
- **WHEN** the reader draws on the second page
- **THEN** one change event is reported for the second page

### Requirement: Comments are text annotations

The package SHALL list a document's comments as its text annotations and add a comment as a text annotation at a point on a page.

#### Scenario: Adding a comment on a page

- **GIVEN** a document open in the viewer
- **WHEN** the consumer adds a comment at a point on the second page
- **THEN** the comment list holds it with its page and its text
- **AND** the saved bytes hold it as a text annotation

#### Scenario: Listing a document's comments

- **GIVEN** a document saved with two text annotations
- **WHEN** it is opened
- **THEN** the comment list holds both, each with its page

#### Scenario: A document with no comments

- **GIVEN** a document with no text annotations
- **WHEN** it is opened
- **THEN** the comment list is empty

### Requirement: Annotations are exchanged as XFDF

The package SHALL write a document's annotations as XFDF and read XFDF back into them, changing nothing when the text cannot be read.

#### Scenario: An XFDF round trip

- **GIVEN** a document with a comment and an ink annotation
- **WHEN** its annotations are written as XFDF and read into a fresh copy of the document
- **THEN** the copy holds the same annotations on the same pages

#### Scenario: Importing XFDF that is not well formed

- **GIVEN** a document with one comment
- **WHEN** text that is not well-formed XML is read as XFDF
- **THEN** an error naming the problem is returned
- **AND** the document still holds only its one comment

### Requirement: A download carries the edits and the watermark

The package SHALL download the original bytes while nothing has changed and no watermark is set, and otherwise the saved bytes, with the watermark written on every page when one is set.

#### Scenario: A watermarked download

- **GIVEN** a three-page document and a watermark text
- **WHEN** the document is downloaded
- **THEN** every page of the downloaded bytes carries the watermark as a free-text annotation
- **AND** the pages on screen do not

#### Scenario: An unedited document downloads its original bytes

- **GIVEN** a document nobody has edited and no watermark
- **WHEN** it is downloaded
- **THEN** the downloaded bytes equal the bytes it was loaded from
