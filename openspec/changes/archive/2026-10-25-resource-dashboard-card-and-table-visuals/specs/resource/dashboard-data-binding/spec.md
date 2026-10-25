## MODIFIED Requirements

### Requirement: A bound visual's aggregation is computed per category

The dashboard SHALL compute each bound series as count, sum, average, minimum or maximum per x-column category, except a card, which computes its one series over every row of the query.

#### Scenario: Each aggregation gives its own value

- **GIVEN** a series over a category with several values
- **WHEN** the visual draws it under each aggregation
- **THEN** count, sum, average, minimum and maximum each show their own value for that category
