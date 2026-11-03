# vue-pdfjs-headless/annotations Specification

## Purpose

A document's form values and the watermark a download carries, as the headless package `vue-pdfjs-headless` states them: the renderer's storage filled and saved into the bytes of a download, and a watermark stamped only on that download, with no styling and no controls of its own.

## Requirements

### Requirement: Forms are filled and kept on save

The package SHALL keep the values a reader types into a document's form fields in the bytes a download carries.

#### Scenario: Filling a form and downloading it

- **GIVEN** a document with a text field
- **WHEN** the reader types into the field and downloads the document
- **THEN** the downloaded bytes are the renderer's saved bytes, which carry the typed value

### Requirement: A download carries the form values and the watermark

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
