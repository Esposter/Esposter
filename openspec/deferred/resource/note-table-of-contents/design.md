# Note table of contents

A block that lists a note's headings as links to them, in the editor and in the published note, as Notion's table of contents block does, and the page-level outline Notion draws beside a page with two or more headings.

## Why deferred

The block is a custom node drawn twice, as an editor node view and as `generateHTML` output the published view sanitizes, and a link to a heading needs the heading to carry an id the render and the editor agree on, which StarterKit's heading does not. A note is one owner's meeting notes or spec, rarely long enough to be lost in, and the browser's own find reaches a heading in a published page.

## Revisit when

A published note is asked for deep links to its headings, or a note long enough to scroll through several screens is asked for a way to move through it. The heading ids come first, as their own change, and the block follows as one more slash item.
