## Why

A bound visual lists its categories in the order the dataset's rows first name them, so a bar chart of sales by region draws its bars in the order the sheet happens to hold. An owner cannot put the largest first, or the months in order, without reordering the sheet itself. The reference sorts a visual's axis by a field, ascending or descending.

## What Changes

- A bound visual takes an optional order: sort by the category, or by one of its series, ascending or descending.
- Until an order is chosen, categories keep the first-seen order they have today.
- A Table's columns still sort by header for the reader, which does not change the visual's own order.
- A stored order naming a series the query does not have is refused.

## Capabilities

### Modified Capabilities

- dashboard-data-binding (resource/dashboard-data-binding): a query gains an optional order of its categories.

## Impact

The visual's binding form gains an Order control, and the shared query schema gains one optional field. A stored visual without it reads the first-seen order, so no stored dashboard changes. The exported rows follow the drawn order.
