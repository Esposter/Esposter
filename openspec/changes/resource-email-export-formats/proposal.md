## Why

An email's only export is the personalized HTML, which refuses an email with no bound dataset. An author who wants the email as a file, to keep, to review or to hand to another tool, has no way to get one. The MJML source writer exists and is tested, but nothing calls it, so the source is not available either.

## What Changes

- The email exports one HTML file, the file its preview draws, with or without a bound dataset.
- The email exports its MJML source as one file, which imports back to the same email.
- Each export saves the open email first, and a refused save stops the download.
- The export commands list HTML, MJML source and personalized HTML.

## Capabilities

### Modified Capabilities

- `resource/email-personalization`: the email's export surface gains two formats beside the personalized one.

## Impact

Two entries join the email's portable formats. Both reuse the compile the preview and the web view already run, and the MJML source writer that has no caller today. No server procedure is added.
