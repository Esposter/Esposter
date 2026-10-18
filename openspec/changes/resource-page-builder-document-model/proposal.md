# Document model

## Why

The webpage and email editors need one document shape that both editors and the server can read, with each node type declaring how it is edited and how it is published. The shape the published-data standards already use is a small tree of typed nodes, which the document takes rather than inventing one. Publishing must produce the output on the server, so the working copy holds only the tree and no saved document captures derived HTML.

## What Changes

A webpage and an email are stored as a tree of typed nodes, and publishing renders them on the server.

- A webpage or an email is a tree of typed nodes. Node ids are unique within a document, and a document over a fixed node limit is refused.
- Each node type declares its fields, the child types each of its slots accepts, and its published output. The editor and the server share the registry.
- The webpage types are Section and Columns for layout; Text, Button, Image, Video, Map and Custom HTML for content; Countdown, Tabs, Tooltip and Typed text for extras; and one Survey invite type for each published survey.
- Each webpage type publishes accessible output by construction: an image needs its alternative text or a decorative flag, a video or map needs a title, and a button is a real link.
- Publishing a webpage renders one HTML document. Publishing an email compiles its markup on the server.
- **BREAKING:** Publishing an email refuses markup that fails strict validation, with its own message, where it previously checked only that HTML was present.
- A webpage can be exported as one self-contained HTML file.
- A survey invite links its survey, so deleting the survey warns about the page that holds the invite.
- **Capabilities:** `resource/page-builder/document-model` (new).

## Capabilities

- **resource/page-builder/document-model** (new)

## Waiting on

None.

## Impact

- The stored document of a webpage and an email, which becomes the tree; the cutover removes the documents saved in the previous format.
- The publish path for webpages and emails, which renders the output and bakes it into the published version.
- The webpage and email views, which serve the baked HTML whole.
- The Note's text schema, which is shared as the rich text inside a text node.
- The resource link registry, which indexes a survey invite's survey.
- The export of a webpage as an HTML file.

Size kept as the source page's own: splitting it is a later decision.
