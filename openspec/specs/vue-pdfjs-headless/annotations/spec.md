# vue-pdfjs-headless/annotations Specification

## Purpose

A document's forms, drawn annotations, comments and XFDF free texts, and the download that carries them, as the headless package `vue-pdfjs-headless` states them: the renderer's storage filled and saved, its edits reported, comments listed, free texts exchanged, and a watermark stamped only on the download, with no styling and no controls of its own.

## Requirements

### Requirement: Forms are filled and kept on save

The package SHALL keep the values a reader types into a document's form fields in the bytes a download carries.

#### Scenario: Filling a form and downloading it

- **GIVEN** a document with a text field
- **WHEN** the reader types into the field and downloads the document
- **THEN** the downloaded bytes are the renderer's saved bytes, which carry the typed value

### Requirement: The editor mode is set and drawn annotations are reported

The package SHALL set the renderer's editor mode to none, free text, ink, highlight or stamp, and SHALL report each annotation the reader draws with the mode it was drawn in and its page.

#### Scenario: Switching the editor mode

- **GIVEN** a document open in the viewer
- **WHEN** the consumer sets the mode to ink
- **THEN** the renderer's editor mode is ink
- **AND** setting the mode to none sets the renderer's mode to none

#### Scenario: Drawing reports a change

- **GIVEN** the editor mode is ink
- **WHEN** the reader draws on the second page
- **THEN** one change is reported, with the ink mode and page two

#### Scenario: Removing an annotation reports nothing

- **GIVEN** the editor mode is ink
- **WHEN** the reader removes an annotation
- **THEN** no change is reported

### Requirement: Comments are listed

The package SHALL list a document's text annotations as its comments, each with its page. The package does not add comments: the renderer's save writes no text annotation, so a comment added would not reach a download.

#### Scenario: Listing a document's comments

- **GIVEN** a document with two text annotations, on pages one and two
- **WHEN** it is opened
- **THEN** the comment list holds both, each with its page

#### Scenario: A document with no comments

- **GIVEN** a document with no text annotations
- **WHEN** it is opened
- **THEN** the comment list is empty

### Requirement: Free texts are exchanged as XFDF

The package SHALL write free-text annotations as XFDF and read XFDF back into them, from a `vue-pdfjs-headless/xfdf` subpath that loads no renderer. Reading XFDF that is not well-formed SHALL return an error and change nothing.

#### Scenario: An XFDF round trip

- **GIVEN** a free text on the second page
- **WHEN** it is written as XFDF and read back
- **THEN** the free text is the same, with its page and rectangle

#### Scenario: Importing XFDF that is not well formed

- **GIVEN** a document holding one free text
- **WHEN** text that is not well-formed XML is imported
- **THEN** an error naming the problem is returned
- **AND** the document still holds only its one free text

#### Scenario: Importing a free text past the last page

- **GIVEN** a document of one page
- **WHEN** an XFDF file with a free text on page two is imported
- **THEN** an error naming the page is returned
- **AND** nothing is stored

#### Scenario: A drawn free text is exported

- **GIVEN** a free text drawn on the second page
- **WHEN** the document is exported as XFDF
- **THEN** the XFDF holds that free text with its page and rectangle

### Requirement: A download carries the edits and the watermark

The package SHALL download the original bytes while nothing has changed and no watermark is set. Otherwise it SHALL download the renderer's saved bytes, with the watermark written on every page when one is set, and the watermark SHALL NOT remain in the document's storage once the download is saved.

#### Scenario: A watermarked download

- **GIVEN** a three-page document and a watermark text
- **WHEN** the document is downloaded
- **THEN** every page of the saved bytes carries the watermark as a free-text annotation
- **AND** the storage holds no watermark once the download is saved

#### Scenario: An unedited document downloads its original bytes

- **GIVEN** a document nobody has edited and no watermark
- **WHEN** it is downloaded
- **THEN** the downloaded bytes equal the bytes it was loaded from
