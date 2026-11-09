# Preview Device Presets

SurveyJS's preview shows a survey at a phone, tablet or desktop width in a device frame, and turns it with an orientation toggle. This record covers the device presets and the orientation toggle.

## Why deferred

Preview draws the runner at the editor's own width, so the runner has the width a respondent has ([survey layout design](../../../specs/resource/survey-layout/design.md)). A device frame and an orientation toggle are a preview of their own, and the [inline-editing change](../../../changes/resource-survey-creator-inline-editing/design.md) defers them to the preview's own change.

**Revisit when:** the preview's own change is designed, which the inline-editing change names as the place device frames land.
