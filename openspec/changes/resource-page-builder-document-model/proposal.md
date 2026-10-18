# Document model

## Why

The webpage and email editors need one document shape that both editors and the server can read, with each node type declaring how it is edited and how it is published. The shape the published-data standards already use is a small tree of typed nodes, which the document takes rather than inventing one. Publishing must produce the output on the server, so the working copy holds only the tree and no saved document captures derived HTML.

## What Changes

A webpage and an email gain a document of typed nodes, with the renderers that turn it into published output, built beside the editor that runs today.

- A webpage or an email is a tree of typed nodes. Node ids are unique within a document, and a document over a fixed node limit is refused.
- Each node type declares its fields, the child types each of its slots accepts, and its published output. The editor and the server share the registry.
- The email types are MJML's components from the MJML blocks package, with the survey invite added.
- The webpage types are Section and Columns for layout; Text, Button, Image, an uploaded Video and Custom HTML for content; Countdown, Tabs, Tooltip and Typed text for extras; and one Survey invite type for each published survey.
- Each webpage type publishes accessible output by construction: an image needs its alternative text or a decorative flag, a video needs a title, and a button is a real link.
- A webpage document renders to one HTML document, and the server compiles an email document, refusing markup that fails strict validation with the validator's message.
- Each open document is held apart, loaded and saved through what its caller passes, so nothing the running editor reads or writes changes until the cutover binds the new documents.
- **Capabilities:** `resource/page-builder/document-model` (new).

## Capabilities

- **resource/page-builder/document-model** (new)

## Waiting on

None.

## Impact

- New documents, registries and renderers beside the stored webpage and email, which the cutover binds in their place.
- The server, which gains the email markup compiler.
- The Note's text schema, which is shared as the rich text inside a text node.
