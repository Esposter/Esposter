# Outline Collapse

SurveyJS lets an author collapse and expand elements in the survey tree, and drag an element onto a collapsed one. This record covers that collapse and expand over the Creator's outline.

## Why deferred

The outline holds no collapse state for its rows, since it is one flat list indented by depth ([inline-editing change](../../../changes/resource-survey-creator-inline-editing/design.md)). A collapse would add a flag per row and a rule for how a drag lands on a folded element. The Creator's surveys are short enough to scroll, so that state would be paid for before a survey needs it.

**Revisit when:** a survey outgrows scrolling, so that an author folds part of it away to work on another part.
