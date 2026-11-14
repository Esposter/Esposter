## Purpose

Full-text search over resource names and tags. Each word of a query finds the resources whose name or tags hold it as a whole word, the last word also finds what it starts, and a name match ranks ahead of a resource matched only by a tag.

## Requirements

### Requirement: Each word finds the resource by its name or its tags

The resource search SHALL find the owner's resources whose name or tag keys and values hold each query word as a whole word.

#### Scenario: A word finds the name that holds it

- **GIVEN** the owner has a resource named "Email campaign"
- **WHEN** they search for "campaign"
- **THEN** "Email campaign" is listed in the results

#### Scenario: A word finds a resource by its tag

- **GIVEN** the owner has a resource named "Notes" tagged with "budget" set to "2026"
- **WHEN** they search for "budget"
- **THEN** "Notes" is listed in the results

### Requirement: The last word matches what it starts

The resource search SHALL match the last word of a query as a prefix, so a word still being typed finds its completions.

#### Scenario: A partial last word finds the name

- **GIVEN** the owner has a resource named "Monthly sales"
- **WHEN** they search for "monthly sal"
- **THEN** "Monthly sales" is listed in the results

#### Scenario: A fragment inside a word does not match

- **GIVEN** the owner has a resource named "Email campaign"
- **WHEN** they search for "ai"
- **THEN** "Email campaign" is not listed in the results

### Requirement: A name match ranks first, then the closest match, then the order asked for

The resource search SHALL order results so that a resource matched by its name comes before one matched only by a tag, then by how closely the words match, then by the sort the owner asked for, which defaults to most recently updated.

#### Scenario: A name match ranks above a tag-only match

- **GIVEN** a resource named for the query and another resource that matches the query only through a tag
- **WHEN** the owner searches for the query
- **THEN** the resource named for the query is listed first

#### Scenario: Equal matches list the newest first

- **GIVEN** two resources match the query equally and one was updated more recently
- **WHEN** the owner searches
- **THEN** the more recently updated one is listed first

### Requirement: The result count matches the list

The resource search SHALL report a result count that matches the results it lists.

#### Scenario: The count agrees with the list

- **GIVEN** a search returns several resources
- **WHEN** the owner sees the count
- **THEN** the count equals the number of resources listed

### Requirement: Query characters are words, never search syntax

The search SHALL treat every character of the query as text to find, so a query cannot open an operator or a wildcard.

#### Scenario: A percent sign matches only itself

- **GIVEN** the owner has a resource whose name and tags contain no percent sign
- **WHEN** the owner searches for a percent sign
- **THEN** that resource is not listed
