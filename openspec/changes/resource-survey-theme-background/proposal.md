## Why

The Theme tab sets a logo, two colours, a progress bar and question numbers, but no picture behind the survey. The survey-resource spec already says a survey accepts uploaded images for its logos and theme backgrounds, so the spec promises a picture the Theme tab cannot set. The reference product sets a background image in its theme's background options.

## What Changes

- The Theme tab uploads a background picture and removes it, as it does the logo.
- The respondent page draws the picture behind its content, over the background colour. The Theme tab's preview draws it the same way.
- A picture that fails validation is refused before the upload, as a logo is.
- The picture is one of the survey's files, so a removed picture is deleted when the editor closes.

## Capabilities

### Modified Capabilities

- `survey-theme-files`: a survey takes a background picture on the Theme tab and draws it behind its respondent page.

## Impact

One root prop is added, so a survey saved before this change reads no picture. The root form omits the new prop, as it omits the logo. No stored response, route or server read changes. The theme-files design's statement of the theme subset gains the picture. The survey-resource requirement stays as written, since it is true once this ships.
