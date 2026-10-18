## Purpose

The one map every transport path reads to know which classes serialize, and why its keys are an on-disk format that a rename must not move.

## Requirements

### Requirement: A serializable class is listed once in the shared registry

A class that crosses a serialization boundary SHALL be listed once in the shared class registry, and every transport path SHALL pick it up from that one listing.

#### Scenario: Adding a new serializable class

- **GIVEN** a new class that must cross a page load or a procedure call
- **WHEN** it is added with one entry in the shared registry
- **THEN** page loads and procedure calls both revive it as the same class

#### Scenario: The table reads do not consult the shared registry

- **GIVEN** a new message kind read from table storage
- **WHEN** it is added
- **THEN** it is registered in the message kind map used for table reads as well as in the shared registry

### Requirement: A registered class name is never renamed

A registered class name SHALL NOT be renamed, because the name is stored inside saved data and a rename would stop that data from being revived.

#### Scenario: A registered class is renamed

- **GIVEN** a registered class whose name is stored inside saved data
- **WHEN** a change renames the class
- **THEN** the registry check fails rather than moving the stored name

#### Scenario: A feature folder is renamed

- **GIVEN** a feature whose folder name differs from the names of its registered classes
- **WHEN** the folder is renamed
- **THEN** the registered class names stay as they were
