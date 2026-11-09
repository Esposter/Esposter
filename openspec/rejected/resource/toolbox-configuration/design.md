# Toolbox Configuration

SurveyJS lets an embedder configure its toolbox: category titles and collapsible groups, a full or compact density, a subset of the question and panel kinds, and a renamed, added or reordered set of items, through a developer API or JSON. This record covers those four rows of the Creator's palette.

## Why not

The palette lists the kinds an insertion point takes, in six named groups that are constants in the app ([survey creator design](../../../specs/resource/survey-creator/design.md), `apps/web/app/services/resource/survey/constants.ts`). Each setting above is an embedder's toolbox API, and Esposter has no embedder that would write one. A custom toolbox item would be a new document kind, which changes the document's schema rather than a setting. The groups stay constants unless the app itself needs a configured palette.
