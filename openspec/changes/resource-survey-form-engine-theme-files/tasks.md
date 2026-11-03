# Tasks

Build order. The theme and the files are independent.

## 1. Theme

- [ ] 1.1 Write `useSurveyTheme`, apply it in the page renderer, and build the Theme tab.
      Verify: a component test shows the accent applied in both design styles, and a survey with no theme follows the style's tokens.
- [ ] 1.2 Apply the progress bar position and question numbering from the root props in the page renderer and the Creator's preview.
      Verify: the two scenarios in the spec delta's progress requirement are tests, and a survey with both settings off shows neither.

## 2. Files

- [ ] 2.1 Write `useSurveyFiles`: collect the urls a document references, and the sweep.
      Verify: both scenarios in the spec delta's file requirement are tests, and a url still referenced is kept.
- [ ] 2.2 Build the image upload editors for the image question, the image picker's choices and the logo, and add their entries to the extras map.
      Verify: an upload then a removal then a close leaves no orphaned file for any of the three.
