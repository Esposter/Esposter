# Brand kit resource

A **Brand kit** resource holding an organization's visual identity — palette, logo asset, font choices — that the GrapesJS editors (email, webpage) and the SurveyJS theme could consume, so one branding decision propagates to every outward-facing artifact instead of being restyled per resource.

## Why deferred

There is no shared theming pipeline to plug into: GrapesJS styling is per-canvas CSS, the SurveyJS theme lives inside the survey model, and neither has a variable-injection seam today. Building the kit first means building a cross-editor theming abstraction for a need no user has expressed — and a single-consumer mechanism fails the capability admission rule in spirit. Logo hosting alone is covered by [resource file assets](../../../specs/resource/resource-file-assets/design.md).

## Revisit when

Someone maintains the same branding across two or more publishable resources and re-applies a change by hand more than once — then design the consumption seam (probably CSS-variable injection at the view/export layer) before the resource type.
