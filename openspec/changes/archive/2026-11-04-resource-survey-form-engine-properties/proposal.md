# Survey Properties

Part of the [survey form engine program](../../resource-survey-form-engine-program/design.md).

## Why

Selecting a question in SurveyJS's Creator opens a property grid with a list for its choices, a table for its matrix columns and an editor for each setting. The replacement draws a selected element's settings from its own props schema, so the form can never offer a setting the kind lacks or accept one the schema refuses, and adds the three list editors that a form cannot draw.

## What Changes

- A properties panel that draws the selected node's settings with the UI library's schema form, from the node type's form schema.
- A choice list editor, a matrix column editor and a multiple text item editor, each editing its list through the core's property update.
- A map from a kind to the extra editors it needs beside its form.

## Capabilities

- **resource/survey-properties** (new): choices are added, reordered and removed from the property panel and reach the document, and a matrix's columns likewise.
