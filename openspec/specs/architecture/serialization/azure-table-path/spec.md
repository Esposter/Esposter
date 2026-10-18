## Purpose

How an entity read from Azure Table is rebuilt as its class — date columns arrive as Date, JSON columns are parsed and their dates restored.

## Requirements

### Requirement: Stored rows come back with their dates as dates

An entity read from table storage SHALL come back with each date field as a date and each list or object field in its original structure, with the dates inside those fields restored.

#### Scenario: A stored message with attachments and mentions

- **GIVEN** a stored message that holds a list of attachments with dates and a list of mentions
- **WHEN** the message is read back from table storage
- **THEN** its date fields are dates
- **AND** its attachment dates inside the list are dates
- **AND** its mentions are a list of text

#### Scenario: A row that cannot be matched to a message kind

- **GIVEN** a stored row whose kind is not registered for reading
- **WHEN** the row is read back
- **THEN** the row is not rebuilt as a message of any kind

### Requirement: A new message kind is registered for table reads as well as for transport

A new kind of stored message SHALL be registered in the message kind map used for table reads, as well as in the shared class registry.

#### Scenario: Adding a new message kind

- **GIVEN** a change that adds a new kind of stored message
- **WHEN** the change is reviewed
- **THEN** the kind is registered in the message kind map used for table reads
- **AND** the kind is registered in the shared class registry
