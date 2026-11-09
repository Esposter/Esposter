# Outline Search

SurveyJS's survey tree has a search box above ten items, so an author finds an element by its name in a long survey. This record covers that search over the Creator's outline.

## Why deferred

The outline is one flat list indented by depth, with no search field ([inline-editing change](../../../changes/resource-survey-creator-inline-editing/design.md)). The outline is short in practice, so a search box would add a control to every survey for a length the surveys do not reach. A search would also sit beside a list that already shows each element once, in document order.

**Revisit when:** surveys grow long enough that an author scrolls the outline to find an element as a matter of course.
