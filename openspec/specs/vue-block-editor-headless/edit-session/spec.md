# vue-block-editor-headless/edit-session Specification

## Purpose

An editing session holds one document's undo history and its selected node for an editor store, so a commit sets the document and its history together and a load starts with a fresh history and no selection. The selection is held by node id, so an edit that moves the node keeps it selected, and a node the edit removes reads as nothing selected.

## Requirements

### Requirement: A commit sets the document and the history together

An editing session SHALL replace its document and its undo history in one step, so neither is ever ahead of the other.

#### Scenario: A commit sets the document and the history together

- **GIVEN** an editing session with a document and a history
- **WHEN** an edit is committed with its new document and its new history
- **THEN** the session's document and history are both the new ones
- **AND** no reader sees one without the other

### Requirement: A load starts a fresh history

Loading a document into an editing session SHALL clear the history and the selection, since a loaded document has nothing to undo.

#### Scenario: A load clears the history and the selection

- **GIVEN** an editing session with a history and a selected node
- **WHEN** a document is loaded
- **THEN** the history is empty
- **AND** nothing is selected

### Requirement: The selection survives a move

An editing session SHALL hold the selection as a node id, so an edit or an undo that moves the node keeps it selected.

#### Scenario: A move keeps the node selected

- **GIVEN** a selected node
- **WHEN** an edit moves it to another place in the document
- **THEN** the same node is still selected

#### Scenario: A selection of a removed node reads as nothing selected

- **GIVEN** a selected node
- **WHEN** an edit removes it
- **THEN** the session reads no selected node
