# Tasks

Build order. The theme and the files are independent.

## 1. Theme

- [x] 1.1 Write `useSurveyTheme`, apply it in the page renderer, and build the Theme tab.
      Verify: a component test shows the accent applied in both design styles, and a survey with no theme follows the style's tokens.
- [ ] 1.2 Apply the progress bar position and question numbering from the root props in the page renderer and the Creator's preview. Not done: the runner draws the progress bar from its root prop, but it numbers every question whatever the numbering setting holds, and no test holds either scenario.
      Verify: the two scenarios in the spec delta's progress requirement are tests, and a survey with both settings off shows neither.

## 2. Files

- [x] 2.1 Write `useSurveyFiles`: collect the urls a document references, and the sweep.
      Verify: both scenarios in the spec delta's file requirement are tests, and a url still referenced is kept.
- [ ] 2.2 Build the image upload editors for the image question, the image picker's choices and the logo, and add their entries to the extras map. Not done: the editors are built and tested, but `SurveyImageExtras` is not mounted by the properties panel, which reads only `SurveyNodeExtrasComponentMap`, so the image question and the image picker have no editor in the Creator. The logo's upload is mounted in the Theme tab.
      Verify: an upload then a removal then a close leaves no orphaned file for any of the three.
