## ADDED Requirements

### Requirement: A search matches a resource by the names and values of its tags

The explorer's search SHALL list a resource whose tag name or tag value contains the query, in the same results as a resource whose name matches.

#### Scenario: A tag value finds its resource

- **GIVEN** a resource tagged environment with the value production
- **WHEN** the owner searches for production
- **THEN** the resource is listed

#### Scenario: A tag name finds its resource

- **GIVEN** a resource tagged owner
- **WHEN** the owner searches for owne
- **THEN** the resource is listed

#### Scenario: A tag match is counted with the list

- **GIVEN** a search that matches a resource only by one of its tags
- **WHEN** the owner reads the result count
- **THEN** the count includes that resource

#### Scenario: See all lists a tag match

- **GIVEN** the owner has typed a query that matches a resource only by a tag
- **WHEN** the owner picks See all results
- **THEN** the full resource list opens with that resource in it
