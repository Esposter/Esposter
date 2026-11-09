# Logic Rule Filters

SurveyJS's Logic tab lists its rules, and an author can filter that list by question or by action type. This record covers that filter.

## Why not

Esposter keeps no list of rules. Each condition belongs to the element it edits, and the Logic tab shows that element's rows ([survey layout design](../../../specs/resource/survey-layout/design.md), "Logic stays with the element it edits"). With no list across the survey, a filter by question has nothing to narrow. A filter by action type has nothing to narrow either, since the logic only shows, hides, enables and requires elements. The actions are the [deferred logic actions](../../../deferred/resource/logic-actions/design.md).
