# @esposter/jobs

[![Apache-2.0 licensed][badge-license]][url-license]

Runs Esposter's asynchronous work as a Cloudflare Worker, consuming a Queue per job: account deletion, data export, blob and orphaned profile image deletion, notification and webhook delivery, and storage ledger reconciliation. A Cron Trigger runs the nightly purge of deleted resources.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="commands">⌨️ Commands</a>

Run these commands from `apps/jobs/`:

```bash
pnpm dev           # wrangler dev, the dev environment
pnpm build         # bundle the prod Worker to dist/, a dry run that checks its size
pnpm deploy:worker # wrangler deploy, the prod Worker
```

## <a name="license">⚖️ License</a>

Licensed under [Apache-2.0][url-license].

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
