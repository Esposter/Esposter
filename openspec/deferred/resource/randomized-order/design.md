# Randomized Order

SurveyJS shuffles, for each respondent, the rows of a single-select matrix and the questions within a page or a panel. This record covers both random orders.

## Why deferred

Choice order is already random and seeded. The runner shuffles a list's choices from the response's id, so the order holds across renders and across a reload ([survey runner design](../../../specs/resource/survey-runner/design.md)). A matrix's random rows would be one more prop beside that shuffle. Random questions would be a new option for a page's order, and the runner has no such option. No owner has asked for either, and each is niche.

**Revisit when:** an owner asks for random rows in a matrix, or for random questions within a page or panel.
