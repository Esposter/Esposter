## Purpose

Azure tag parity — name:value pairs on every resource, shown in Essentials, editable in place, filterable on the list.

## Requirements

### Requirement: Resources carry name and value tags

Every resource SHALL carry a set of tags, each a name paired with a value, with no name appearing twice on one resource.

#### Scenario: Resource with tags

- **GIVEN** a resource with tags
- **WHEN** the owner opens the resource's Essentials
- **THEN** each tag is shown as a name and value

#### Scenario: Resource with no tags

- **GIVEN** a resource that has no tags
- **WHEN** the owner opens the resource's Essentials
- **THEN** no tags are shown

### Requirement: A tag needs a name but may have an empty value

A tag SHALL require a non-empty name, while its value MAY be empty.

#### Scenario: Tag saved with an empty value

- **GIVEN** the owner enters a tag name and leaves its value empty
- **WHEN** the owner saves the tags
- **THEN** the tag is kept with an empty value

#### Scenario: Row with a blank name

- **GIVEN** the tag editor holds a row with no name
- **WHEN** the owner saves the tags
- **THEN** that row is dropped and not stored

### Requirement: Saving tags replaces the whole set

Saving the tag editor SHALL replace the resource's whole tag set, so a tag left out of the editor is removed.

#### Scenario: Removing a tag

- **GIVEN** a resource tagged environment and owner
- **WHEN** the owner removes the owner tag in the editor and saves
- **THEN** the resource keeps only the environment tag

### Requirement: Tag limits are enforced

A tag set beyond the allowed number of tags, or a tag name or value beyond its length limit, SHALL be refused.

#### Scenario: Too many tags

- **GIVEN** a resource that already holds the maximum number of tags
- **WHEN** the owner saves one more tag
- **THEN** the save is refused

#### Scenario: Tag name too long

- **GIVEN** a tag name longer than the allowed length
- **WHEN** the owner saves the tag
- **THEN** the save is refused

### Requirement: The tag filter matches a name and value exactly

Filtering by a name and a value SHALL list only the resources that carry that exact name and value.

#### Scenario: Name and value filter

- **GIVEN** resources tagged environment with prod, and resources tagged environment with dev
- **WHEN** the owner filters the list by environment with the value prod
- **THEN** only the resources tagged environment with prod are listed
- **AND** the count matches the listed resources

### Requirement: The tag filter matches a name alone

Filtering by a name alone SHALL list the resources that carry a tag of that name with any value.

#### Scenario: Name-only filter

- **GIVEN** resources tagged environment with prod, resources tagged environment with dev, and resources with no environment tag
- **WHEN** the owner filters the list by environment with no value
- **THEN** the resources tagged environment with prod and those tagged environment with dev are listed

### Requirement: The tag list counts resources by tag name

The tag list SHALL show each tag name with how many resources carry it, counted by name regardless of value.

#### Scenario: Tag names with counts

- **GIVEN** resources tagged environment with prod and resources tagged environment with dev
- **WHEN** the owner opens the tag list
- **THEN** environment is shown with a count of two

### Requirement: A tag change is not a rename

Changing only a resource's tags SHALL NOT be recorded as a rename in the activity log.

#### Scenario: Tags changed without a name change

- **GIVEN** a resource with a name
- **WHEN** the owner changes only its tags
- **THEN** the activity log holds no rename entry for the resource

### Requirement: Global search does not match tags

Global search SHALL NOT find resources by their tag text.

#### Scenario: Searching for a tag value

- **GIVEN** a resource tagged environment with prod
- **WHEN** the owner searches globally for prod
- **THEN** the resource is not found through its tag
