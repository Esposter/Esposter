# Cloudflare cutover

## Why

The code runs on Cloudflare once the branch merges, but the data and the domain are still on Railway, Azure and Namecheap's DNS. The cutover moves them without losing a row or a file, with a tested way back.

## What changes

A committed cutover command copies, verifies and re-schedules; a rehearsal on the dev estate measures it; the production run freezes writes, copies, verifies, switches DNS and keeps the old estate read-only until the rollback window closes; then the old estate is torn down. Part of the [Cloudflare program](../infra-cloudflare-program/proposal.md); the mechanics are in [design](design.md).
