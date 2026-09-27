---
title: LiveKit stack trim
description: Dropping Redis and the develop environment's LiveKit services to lower Railway usage.
---

# LiveKit stack trim

The LiveKit deployment on Railway runs as three services in each environment: `livekit-server`, `livekit-monitor` and the Redis that holds LiveKit's room state. A single LiveKit node can run without Redis, and the develop environment's LiveKit services sit idle most of the time. Removing Redis from both environments and LiveKit from develop would take a few dollars a month off Railway usage.

**Why not:** The setup is what calls need once Railway routes UDP, and it took real effort to get working. The TCP proxy and the HAProxy forward are the interim half of it. The UDP path is already configured and waits only on Railway ([LiveKit Railway service](https://github.com/Esposter/Esposter/tree/main/livekit-server)). Tearing services out now means wiring their variables and proxies back up by hand later, which is churn with no gain in the product. The saving is also nothing on the bill: the Pro plan includes its own price in usage, and the whole project's usage is well inside that credit. The develop LiveKit is also the only place a call is tested before it reaches production.

## Sources

- [Railway pricing](https://railway.com/pricing) — each plan includes its subscription price as usage credit.
- [Railway app sleeping](https://docs.railway.com/reference/app-sleeping) — an open database connection or any private-network traffic keeps a service awake, so sleeping would not help the idle develop services either.
