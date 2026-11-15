# Cloudflare database

## Why

Postgres runs on Railway and the message-like data on Azure Table Storage with an Azure AI Search index beside it. All three move to D1.

## What changes

The Drizzle schema is SQLite; Azure Table's tables are D1 tables behind a drop-in table client; search is an FTS5 table written with each message; every interactive transaction becomes a batch, a conditional statement or a constraint; tests run on Miniflare's D1. Part of the [Cloudflare program](../infra-cloudflare-program/proposal.md); the mechanics are in [design](design.md).
