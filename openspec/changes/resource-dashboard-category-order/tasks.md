# Tasks

## 1. The order

- [ ] 1.1 Add the optional order to the query model and refuse one naming a series the query does not have. Verify: tests named after the scenarios 'An order naming a missing series is refused' and 'A visual with no order keeps its first-seen categories' written first and seen failing.
- [ ] 1.2 Order the aggregated categories before the axis and the series are read, stable on ties. Verify: tests named after the scenarios 'Categories sort by a series, largest first' and 'Categories that tie keep their first-seen order' written first and seen failing.

## 2. The control

- [ ] 2.1 Add the Order control to the binding form, offering the category and each series. Verify: a test named after the scenario 'The owner orders a bar chart by its series' written first and seen failing.
