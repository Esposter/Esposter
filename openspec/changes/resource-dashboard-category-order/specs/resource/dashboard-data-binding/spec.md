## ADDED Requirements

### Requirement: A bound visual orders its categories as the owner chooses

The owner SHALL order a bound visual's categories by the category or by one of the query's series, ascending or descending, and a visual with no order SHALL list its categories in the order its rows first name them.

#### Scenario: Categories sort by a series, largest first

- **GIVEN** a bar chart bound to sales by region, whose rows name the smallest region first
- **WHEN** the owner orders it by the sales series, descending
- **THEN** the bars run from the largest region to the smallest
- **AND** the exported rows follow the same order

#### Scenario: A visual with no order keeps its first-seen categories

- **GIVEN** a bound visual with no order
- **WHEN** it is drawn
- **THEN** its categories are in the order its rows first name them

#### Scenario: Categories that tie keep their first-seen order

- **GIVEN** two categories with the same value in the ordering series
- **WHEN** the visual is ordered by that series
- **THEN** the one the rows named first comes first

#### Scenario: An order naming a missing series is refused

- **GIVEN** a stored visual whose order names a series its query does not have
- **WHEN** the dashboard is saved
- **THEN** the save is refused

#### Scenario: The owner orders a bar chart by its series

- **GIVEN** a bar chart bound to a query with a sales series, selected in the editor
- **WHEN** the owner chooses the sales series and descending in the Order control
- **THEN** the dashboard saves the order with the visual
- **AND** the canvas redraws the bars in that order
