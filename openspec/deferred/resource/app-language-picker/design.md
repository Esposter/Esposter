# App Language Picker

Two rows of SurveyJS's localisation: the Creator's own interface in other languages, with a custom locale, and the runner's button and status texts, such as Previous, Next, Complete and Page n of m, in a respondent's language. This record covers both, and both wait for the app to have a language picker.

## Why deferred

The app has no language picker, so a survey has no language to follow. The runner's button and status texts are literal strings in `apps/web/app/components/Resource/Survey/Runner.vue`. Localising the app's own interface is the app's language work, and the survey's own strings are covered by the [survey translations record](../survey-translations/design.md).

**Revisit when:** the app gets a translation layer and a language picker ([internationalization](../../architecture/i18n/design.md)), as the survey translations record names.
