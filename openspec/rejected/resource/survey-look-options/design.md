# Survey Look Options

SurveyJS lets an owner set a survey's header text alignment and header area layout, show questions without question boxes, place each question's title and description, set a custom required mark and title pattern, and switch the survey to dark mode. This record covers those six rows of the survey's look.

## Why not

A survey draws with the app's design style, so one look holds across the app ([survey theme files design](../../../specs/resource/survey-theme-files/design.md)). The theme a survey may set is its logo, an accent colour, a background colour, the progress bar's place and question numbering. Each option above is a second look that one survey would carry. With no accent or background set, the survey draws with the design style's own tokens, so dark mode follows the app's mode. The required mark is the app's fixed one (`apps/web/app/components/Ui/RequiredMark.vue`).
