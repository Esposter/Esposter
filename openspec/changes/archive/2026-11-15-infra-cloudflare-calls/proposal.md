# Cloudflare calls

## Why

Calls run on a self-hosted LiveKit SFU on Railway over a TCP-only workaround. They move to Cloudflare RealtimeKit.

## What changes

The server creates meetings, adds participants with presets, removes them and verifies RealtimeKit's webhooks; the client's LiveKit store is replaced by a RealtimeKit store under the same call components; the LiveKit services are deleted. Part of the [Cloudflare program](../infra-cloudflare-program/proposal.md); the mechanics are in [design](design.md).
