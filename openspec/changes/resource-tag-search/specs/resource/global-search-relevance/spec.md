## ADDED Requirements

### Requirement: A resource matched only by a tag ranks below every resource matched by its name

The search SHALL list a resource matched only by one of its tags after every resource matched by its name.

#### Scenario: A name match ranks above a tag-only match

- **GIVEN** a resource named for the query and another resource that matches the query only through a tag
- **WHEN** the owner searches for the query
- **THEN** the resource named for the query is listed first

### Requirement: A wildcard in the query matches only itself

The search SHALL treat a percent sign or an underscore in the query as an ordinary character.

#### Scenario: A wildcard in the query matches only itself

- **GIVEN** the owner has a resource whose name and tags contain no percent sign
- **WHEN** the owner searches for a percent sign
- **THEN** that resource is not listed
