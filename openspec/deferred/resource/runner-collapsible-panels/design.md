# Runner Collapsible Panels

SurveyJS lets a respondent collapse and expand a panel in a long form. This record covers the panel half of that setting. The question-box half is covered by the [survey look options record](../../../rejected/resource/survey-look-options/design.md).

## Why deferred

Neither the runner's design nor its spec holds an open or closed state for a panel, so collapse would be a new state that the respondent's session keeps ([survey runner design](../../../specs/resource/survey-runner/design.md)). It is interaction for long forms, and the runner has no long form that needs it yet.

**Revisit when:** long forms need panels folded away for the respondent.
