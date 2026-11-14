# LiveKit stack trim

## Why

Dropping Redis and the develop environment's LiveKit services to lower Railway usage.

## What Changes

Nothing: this idea is rejected. Its argument is in `design.md`, and it no longer holds: the Cloudflare platform replaced Railway and LiveKit, and calls run on RealtimeKit ([Cloudflare services](../../../specs/architecture/cloudflare-services/design.md)).
