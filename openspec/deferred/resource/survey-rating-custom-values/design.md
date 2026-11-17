# Survey Rating Custom Values

The [rating scale question model](https://surveyjs.io/form-library/documentation/api-reference/rating-scale-question-model) takes `rateValues`, a list of values for its steps, and its `rateMin` applies only while that list is empty. An owner could then label a step or skip a number, where the survey form engine counts every step from its first.

## Why deferred

The form engine's rating is a run of whole numbers from its first step, each step named by its number and stored as that number. The schema, the field, the summary and the stored answers all read the scale that way, so labelled or non-contiguous steps need each step to hold its own value and label, a value model the scale does not have. The numbered scale covers the ratings the form engine offers today, so that model waits for a need the numbered run cannot meet.

**Revisit when:** an owner needs labelled or non-contiguous steps, such as named levels or a scale that skips numbers, and a value model for each step is designed.
