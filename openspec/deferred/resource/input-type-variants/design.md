# Input Type Variants

This record covers three rows about input types: the toolbox's preset variants of a kind, the single-line input's colour, month and week types, and a multiple textbox item's types beyond text, number and email.

## Why deferred

A single-line input's type is one value of a closed enum, holding date, datetime-local, email, number, password, tel, text, time and url (`packages/vue-survey-engine-headless/src/models/SurveyTextInputType.ts`). A multiple textbox item's type is a second closed enum, of text, number and email (`packages/vue-survey-engine-headless/src/models/SurveyMultipleTextItemInputType.ts`). Colour, month and week would be added values of those enums. A variant in the palette would be a second entry for one kind, where the palette holds one entry per kind and the variant is set after insertion in the property form ([survey creator design](../../../specs/resource/survey-creator/design.md)). No owner has asked for these types, so the enum additions wait.

**Revisit when:** owners ask for colour, month or week inputs, or for one-click variants in the palette.
