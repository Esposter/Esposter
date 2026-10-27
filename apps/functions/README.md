# @esposter/functions

[![Apache-2.0 licensed][badge-license]][url-license]

Serverless Azure Functions backend for Esposter, handling asynchronous workloads triggered by Azure EventGrid events, Service Bus queues, and timers — notification delivery, webhook delivery, scheduled message jobs, and resource purging.

Design notes live in [the specs](https://github.com/Esposter/Esposter/tree/main/openspec/specs).

## Table of Contents

- ⌨️ [Commands](#commands)
- ⚖️ [License](#license)

---

## <a name="commands">⌨️ Commands</a>

Run from `apps/functions/`:

```bash
pnpm build        # compile to dist/
```

## <a name="license">⚖️ License</a>

This project is licensed under the [Apache-2.0 license](https://github.com/Esposter/Esposter/blob/main/LICENSE).

[badge-license]: https://img.shields.io/github/license/Esposter/Esposter.svg?color=blue
[url-license]: https://github.com/Esposter/Esposter/blob/main/LICENSE
