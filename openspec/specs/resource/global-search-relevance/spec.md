## Purpose

pg_trgm typo tolerance for resource name search — extension, GIN trigram index, and similarity() ranking. A misspelled query still finds the resource it was meant for, and exact substring matches still appear, including on very short queries.

## Requirements

### Requirement: A misspelled query still finds the resource

The resource search SHALL find resources whose names are close to the query, so that a typo still returns the intended resource.

#### Scenario: A transposed letter still finds the resource

- **GIVEN** the owner has a resource named "Survey"
- **WHEN** they search for "survye"
- **THEN** "Survey" is listed in the results

#### Scenario: An unrelated name is not found

- **GIVEN** the owner has a resource named "Sheet"
- **WHEN** they search for "zebra"
- **THEN** "Sheet" is not listed in the results

### Requirement: Exact matches still appear on short queries

The resource search SHALL keep listing every resource whose name contains the query, including on a query of two characters.

#### Scenario: A two-character query finds names containing it

- **GIVEN** the owner has a resource named "Email campaign"
- **WHEN** they search for "ai"
- **THEN** "Email campaign" is listed in the results

### Requirement: The closest name ranks first, then prefixes, then the newest

The resource search SHALL order results by how closely the name matches, then by names that start with the query, then by most recently updated.

#### Scenario: A typo's match is listed first

- **GIVEN** the owner has resources named "Survey" and "Surveys archive"
- **WHEN** they search for "survye"
- **THEN** "Survey" is listed before "Surveys archive"

#### Scenario: Prefix matches come before other substring matches

- **GIVEN** the owner has resources named "Monthly sales" and "Sales"
- **WHEN** they search for "sales"
- **THEN** "Sales" is listed before "Monthly sales"

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
