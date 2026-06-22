# Server-Side Media Transcoding

Re-encode uploaded video/audio server-side (e.g. via Azure Functions + a queue) into web-friendly formats/resolutions.

## Why deferred

- Too much compute and queue orchestration complexity for current scale.

## Revisit when

Media upload volume and playback-compatibility problems are large enough to justify the compute cost. Until then, rely on client-supplied formats and size/type limits.
