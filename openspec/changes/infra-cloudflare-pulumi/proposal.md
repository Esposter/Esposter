# Cloudflare Pulumi

## Why

The estate is declared with `@pulumi/azure-native` and deployed by Railway. The Cloudflare resources join `apps/infra` and the Workers deploy from CI.

## What changes

A `cloudflare` provider folder declares buckets, databases, queues, custom domains and the zone; a CI job deploys both Workers with Wrangler and applies D1 migrations. Part of the [Cloudflare program](../infra-cloudflare-program/proposal.md); the mechanics are in [design](design.md).
