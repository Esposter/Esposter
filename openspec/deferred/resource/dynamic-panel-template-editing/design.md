# Dynamic Panel Template Editing

SurveyJS lets an author edit a dynamic panel's template on the design surface, with the template's questions drawn and chosen where they sit. This record covers that editing on Esposter's canvas.

## Why deferred

The canvas draws a dynamic panel as a disabled field with its template's questions inside it. The template's elements are chosen in the outline, where the template is a child node ([inline-editing change](../../../changes/resource-survey-creator-inline-editing/design.md)). Editing the template on the surface is left to the dynamic panel's own editing change, which the inline-editing change defers to. A template does not nest another dynamic panel ([survey document design](../../../specs/resource/survey-document/design.md)), so its editing has one rule less than an open tree would need.

**Revisit when:** a dynamic panel's own editing change is designed, or an owner needs a template's questions edited on the design surface.
