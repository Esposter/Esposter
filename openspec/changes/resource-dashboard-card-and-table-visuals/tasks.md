## 1. Visual kinds

- [ ] 1.1 Add the Card and Table kinds, listed first in the visual picker, with no chart type. Verify: a test named after the scenario 'Editing a card offers only its label'.
- [ ] 1.2 Route the two kinds past the chart renderer to their own components, keeping the grid item, the binding, the refresh and the states. Verify: a test named after the scenario 'A table whose read fails shows the error state'.

## 2. Card

- [ ] 2.1 Aggregate the first series over every row, with the label defaulting to the aggregation of the column. Verify: a test named after the scenario 'A card counts every response in its dataset'.
- [ ] 2.2 Show the demo value when unbound, and write large values in compact form. Verify: tests named after the scenarios 'A card with no binding shows the demo value' and 'A card abbreviates a large number'.

## 3. Table

- [ ] 3.1 Render the grouped result as one row per category with sortable headers. Verify: a test named after the scenario 'A table lists each category as a row'.
- [ ] 3.2 Add the totals row, summing count and sum series only. Verify: a test named after the scenario 'A totals row leaves averages blank'.
- [ ] 3.3 Reuse the chart's client aggregation so the table's values equal the chart's. Verify: a test named after the scenario 'A table beside a bar chart shows the bars' exact values'.

## 4. Edit dialog

- [ ] 4.1 Hide the chart type and chart settings for both kinds, and show the Card's label. Verify: tests named after the scenarios 'Editing a card offers only its label' and 'Editing a table offers no extra settings'.
