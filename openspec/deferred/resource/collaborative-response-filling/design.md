# Collaborative Response Filling

SurveyJS lets several respondents fill one response together, each on their own device. This record covers that shared response.

## Why deferred

A response belongs to one respondent. It is held by a participant token, or as an anonymous answer set ([survey response modes design](../../../specs/resource/survey-response-modes/design.md)), and a shared response would give it several writers. Concurrent writes need the multi-writer model that the [resource collaboration record](../../../deferred/resource/document-collaboration/design.md) defers, with an access model, an invitation flow and merge machinery.

**Revisit when:** users ask to write together rather than view, which is the trigger the resource collaboration record names.
