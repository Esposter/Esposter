# Page Builder Provider Embeds

A webpage could embed a video from a provider such as YouTube or Vimeo, or a map from Google Maps, each as the provider's own frame. The [page builder](../../../changes/resource-page-builder-program/design.md) ships Video as an uploaded file instead, played by the page's own `<video>` element, and no Map type.

## Why deferred

A provider's frame is a third-party document, and the app's content policy names no `frame-src`, so `default-src 'self'` refuses it — in the editor's canvas, and in the published view's frame, which inherits the app's policy. The editor's blocks embed nothing that loads today, so shipping without them takes nothing a reader has. An uploaded video already plays: `media-src` names the storage container the resource's files are served from.

Embedding a provider means naming its origins in `frame-src`, on the routes that render a webpage, so no other route's policy widens. Each named origin is a third party that a reader's browser contacts and that can track them, and it is a list to keep current as providers move their players.

## Revisit when

An owner needs a video they cannot upload, such as a provider's live stream, or a map.

## Cheaper interim

Video plays an uploaded file. A map can be an image with a link to the provider's page, built from the Image and Button types.
