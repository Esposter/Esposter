# LiveKit Railway service

This service wraps the official `livekit/livekit-server` image with a Railway-specific entrypoint.

Railway does not expose UDP publicly, so this follows the TCP-only Railway template pattern: LiveKit advertises the Railway TCP proxy IP for ICE candidates, and HAProxy forwards Railway's application port to the advertised ICE port inside the container. Redis remains a separate Railway Redis service for room state.

## Railway Setup

1. Create a Railway service from this repo.

2. Configure the service:

```text
Root Directory: livekit-server
Dockerfile Path: Dockerfile
Replicas: 1
```

3. Enable a public domain for WebSocket/API signaling.

4. Add a TCP proxy with application port `7882`.

The TCP proxy's application port must be `7882`. Railway injects `RAILWAY_TCP_PROXY_DOMAIN`, `RAILWAY_TCP_PROXY_PORT`, and `RAILWAY_TCP_APPLICATION_PORT` after the TCP proxy is created. Redeploy this service after the proxy exists.

5. Set the variables:

```text
LIVEKIT_API_KEY=${{secret(32)}}
LIVEKIT_API_SECRET=${{secret(64)}}
LIVEKIT_APP_WEBHOOK_URL=${{shared.BASE_URL}}/api/webhooks/livekit
LIVEKIT_LOG_LEVEL=info
LIVEKIT_MONITOR_WEBHOOK_URL=https://${{livekit-monitor.RAILWAY_PUBLIC_DOMAIN}}/api/webhook
PORT=8080
REDIS_URL=${{Redis.REDIS_URL}}
```

6. Set the Esposter app's LiveKit variables:

```text
LIVEKIT_API_KEY=${{livekit-server.LIVEKIT_API_KEY}}
LIVEKIT_API_SECRET=${{livekit-server.LIVEKIT_API_SECRET}}
LIVEKIT_URL=wss://your-livekit-server.up.railway.app
```

Use the LiveKit service's public Railway/custom domain for `LIVEKIT_URL`.

## Notes

- Keep the first Railway deployment to a single LiveKit replica. Railway's TCP proxy assigns one public proxy port, and WebRTC ICE candidates need a stable endpoint.
- `7882` is the application port entered in Railway's TCP proxy settings. `RAILWAY_TCP_PROXY_PORT` is the public port Railway assigns.
- UDP is the faster transport and this deployment cannot reach it yet: Railway exposes TCP only, so the TCP proxy and the HAProxy forward are what carry media in the meantime. They are the interim half of this setup rather than the target one — the target is Railway routing UDP to the range LiveKit already advertises.
- The entrypoint resolves `RAILWAY_TCP_PROXY_DOMAIN`, passes it to LiveKit as `--node-ip`, and starts HAProxy to forward Railway's container TCP proxy port to LiveKit's advertised ICE/TCP port.
- LiveKit does not document an `external_tcp_port` setting, so `rtc.tcp_port` is set to Railway's external TCP proxy port and the container application port forwards to it.
- The generated config writes no UDP port range, so LiveKit's own `50000-60000` default stands and the shape is the one any host gets: UDP first, TCP as the fallback. Railway routes no UDP today, so those candidates go nowhere and clients settle on the TCP candidate after ICE has tried them — the cost is connection setup time, and the day Railway routes UDP the fast path is already configured. Pinning the range to `0..0` reads as "no UDP" and is not: LiveKit treats a zero `port_range_start` outside development mode as unset and fills the same default back in, so it only makes the config lie. `rtc.force_tcp` would genuinely drop UDP from the gathered candidates, and is the switch to reach for only if that setup delay has to go before Railway ships UDP.
- `LIVEKIT_APP_WEBHOOK_URL` should point at the Esposter app's `/api/webhooks/livekit` route so participant leave and aborted connection events clean up app call state.
- `REDIS_URL` must carry a `redis://` or `rediss://` scheme; the entrypoint matches it case-insensitively and refuses anything else rather than defaulting, because guessing wrong either way connects. `rediss` is what turns TLS on. Credentials follow the URL's own `username[:password]` shape, so `user@` is a username and `:password@` is a password — both halves are percent-decoded, and the host is split on the last `@` so a password holding one survives. A trailing `/n` is the database number and is passed through as `db`. TLS is written as `redis.tls.enabled`; `use_tls` is the deprecated spelling of the same switch and loses to the nested block wherever both appear.
- Railway's `${{Redis.REDIS_URL}}` is the private-network address, so the credentials it carries stay inside the project's encrypted Wireguard mesh and never cross the public internet. That is the trusted-network exception that lets a credentialed `redis://` stand: Railway's Redis offers no TLS listener, so requiring `rediss://` would leave the service with no reachable Redis at all. A URL taken from `REDIS_PUBLIC_URL` or any TCP proxy address does cross the internet and must be `rediss://`.
- `LIVEKIT_MONITOR_WEBHOOK_URL` should point at the livekit-monitor service so the monitor records room and participant events.
