## Purpose

Save as blueprint — select existing resources and capture them into a Blueprint manifest, with cross-resource id references rewritten to local aliases automatically. Capture takes a copy of what is being edited, so the blueprint is reusable without any hand-written manifest.

## Requirements

### Requirement: Capturing a selection creates a blueprint with a copy of each resource

The owner SHALL be able to capture one or more of their resources into a new blueprint, which holds a copy of each resource's content as one entry.

#### Scenario: Capturing several selected resources

- **GIVEN** the owner has selected several resources in the explorer
- **WHEN** the owner chooses Save as blueprint and names it
- **THEN** a new blueprint is created with one entry per selected resource
- **AND** the owner is taken to the new blueprint's editor

#### Scenario: Capturing a single resource from its row menu

- **GIVEN** the owner has one resource in the explorer
- **WHEN** the owner chooses Save as blueprint from that resource's row menu
- **THEN** a blueprint with exactly one entry is created

#### Scenario: Later edits to a source resource do not change the blueprint

- **GIVEN** a blueprint has been captured from a resource
- **WHEN** the owner edits that resource afterwards
- **THEN** the blueprint's entry keeps the content as it was at capture

### Requirement: References between captured resources are rewired to entry aliases

The system SHALL replace every reference between the selected resources with an alias to that resource's entry, and SHALL leave references to unselected resources as they were.

#### Scenario: A reference to another selected resource becomes an alias

- **GIVEN** a selected resource refers to another selected resource by its id
- **WHEN** the blueprint is captured
- **THEN** that reference reads as the other resource's entry alias

#### Scenario: A reference to an unselected resource is kept

- **GIVEN** a selected resource refers to a resource that was not selected
- **WHEN** the blueprint is captured
- **THEN** that reference still points at the original resource

### Requirement: Entry keys come from resource names and stay valid

The system SHALL derive each entry key from its resource's name, SHALL keep each key unique within the blueprint, and SHALL keep each key within the length the blueprint format accepts.

#### Scenario: Colliding names get distinct keys

- **GIVEN** two selected resources have the same name
- **WHEN** the blueprint is captured
- **THEN** their entry keys differ
- **AND** each entry keeps its resource's original name

#### Scenario: A name that grows too long when converted is still a valid key

- **GIVEN** a resource's name is long enough that its derived key would exceed the blueprint's limit
- **WHEN** the blueprint is captured
- **THEN** the entry key is shortened to within the limit
- **AND** the blueprint opens and deploys afterwards

### Requirement: A captured blueprint starts with no parameters

The system SHALL create a captured blueprint with no parameters, so the owner adds any parameters afterwards by hand.

#### Scenario: Capture does not guess parameters

- **GIVEN** a resource whose content contains values that could be variable
- **WHEN** the blueprint is captured
- **THEN** the blueprint has no parameters
- **AND** the values stay as literal text in the entries

### Requirement: A resource with no content captures as an empty entry

The system SHALL capture a resource that was never saved as an entry with no content, and SHALL deploy that entry back as a resource with no content.

#### Scenario: Capturing a never-saved resource

- **GIVEN** a resource whose content was never written
- **WHEN** the owner captures it
- **THEN** its entry has no content

### Requirement: Captures are refused for resources the owner cannot capture

The system SHALL refuse a capture that includes a resource in the recycle bin or one the caller does not own, and SHALL name the refused resource in the refusal.

#### Scenario: A resource in the recycle bin is refused and named

- **GIVEN** the selection includes a resource in the recycle bin
- **WHEN** the owner tries to capture the selection
- **THEN** the capture is refused
- **AND** the refusal names that resource so the owner can restore it first

#### Scenario: A resource the caller does not own is refused

- **GIVEN** the selection includes a resource owned by someone else
- **WHEN** a caller tries to capture the selection
- **THEN** the capture is refused and no blueprint is created
