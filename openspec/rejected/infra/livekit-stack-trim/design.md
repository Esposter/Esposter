# LiveKit stack trim

The LiveKit deployment on Railway ran as three services in each environment: `livekit-server`, `livekit-monitor` and the Redis that holds LiveKit's room state. A single LiveKit node can run without Redis, and the develop environment's services sat idle most of the time, so removing Redis from both environments and LiveKit from develop would take a few dollars a month off the Railway bill.

This record no longer applies. Its reasoning was for staying on Railway until it routed UDP, and the [Cloudflare program](../../../changes/infra-cloudflare-program/design.md) leaves Railway and moves calls to RealtimeKit, so there is no LiveKit deployment left to trim.
