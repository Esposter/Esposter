# vue-pdfjs-headless/annotations Specification

## Purpose

A document's form values as its download carries them, as the headless package `vue-pdfjs-headless` states them: the renderer's storage filled and saved into the bytes of a download, with no styling and no controls of its own.

## Requirements

### Requirement: Forms are filled and kept on save

The package SHALL keep the values a reader types into a document's form fields in the bytes a download carries.

#### Scenario: Filling a form and downloading it

- **GIVEN** a document with a text field
- **WHEN** the reader types into the field and downloads the document
- **THEN** the downloaded bytes are the renderer's saved bytes, which carry the typed value

### Requirement: A download carries the form values

The package SHALL download the original bytes while no form value is stored. Otherwise it SHALL download the renderer's saved bytes, which carry the stored form values.

#### Scenario: An unedited document downloads its original bytes

- **GIVEN** a document nobody has filled in
- **WHEN** it is downloaded
- **THEN** the downloaded bytes equal the bytes it was loaded from
