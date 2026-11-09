## Why

A webpage is checked before it is published for low contrast, fixed widths and unpublished survey invites. An email gets only the validator's messages, which judge whether its markup is valid and say nothing about whether it works. A button with no address, a heading that skips a level and low-contrast text all compile cleanly and go out in a send. The reference's content audit flags missing links in buttons and menus, and the webpage's critique already shows how a deterministic check reports as a warning.

## What Changes

- The email's problems surface lists a warning for each button or navbar link with no address or no text.
- It lists a warning for each heading that is empty or sits more than one level below the heading before it.
- It lists a warning for each text below 4.5 to 1 contrast with its background, and lists a text whose colour the editor cannot read as unchecked.
- A warning never refuses a save, as on the webpage.
- An agent reads the same findings for a saved email under the Resources scope, with colour checks reported as unchecked.

## Capabilities

### Modified Capabilities

- `resource/page-builder/critique`: the webpage's critique gains the email's checks, in the same model.

## Impact

The email has a second walk over its document, separate from the webpage's, sharing the contrast arithmetic. The compile and the validator are unchanged. The read tool answers for emails as it does for webpages.
