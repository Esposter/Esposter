## Why

A rating always starts at one, and a tag box can be bounded only from above. The reference product sets a rating's first step and a multiple-select's minimum selection, and a checkbox here already holds a minimum selection. An owner who wants a score that starts at zero, or a tag box that must take at least two choices, has no setting for either.

## What Changes

- A rating question takes a scale that starts at zero or at one, and its steps are named by their numbers.
- A tag box takes a minimum selection, bounded as a checkbox's is.
- A save is refused when a checkbox or tag box has a minimum selection above its maximum.
- A rating's answer must be a step of its scale, and a selection must hold within its bounds.
- The response summary counts a zero-based rating's steps from zero.

## Capabilities

### Modified Capabilities

- `survey-document`: a save is refused when a checkbox or tag box has a minimum selection above its maximum.
- `survey-runner`: a rating answer is a step of its scale, and a selection holds within its minimum and maximum.
- `survey-response-summary`: a rating card's bars run from the first step of its scale.

## Impact

Existing ratings keep their meaning, since the start defaults to one and no stored answer changes. The rating and tag box settings are drawn by the Creator's form from their schema. A matrix's rating cells keep their one-based scale.
