## Why

A note has no count of what it holds. An owner writing to a length, such as a summary, a bio or a post, leaves the editor to count. The reference shows a word and character count for the page and for the selected blocks.

## What Changes

- The editor shows the note's word count and character count in a line under the text.
- While text is selected, the line shows the selection's counts, and the note's again when the selection is cleared.
- A word is what the runtime's word segmentation reads as a word, so text in a language written without spaces counts as it reads.

## Capabilities

### Modified Capabilities

- note-resource (resource/note-resource): the editor gains a live word and character count.

## Impact

The editor blade gains one line under the document and a service that counts a text's words and characters. Nothing is stored, and the published view shows no count. A note counts from its live document, so a restored version counts as its restored text.
