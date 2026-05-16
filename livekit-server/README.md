# LiveKit Railway service

This service wraps the official `livekit/livekit-server:v1.11.0` image with a Railway-specific entrypoint that requires all deployment variables to be present at startup.

Railway does not expose UDP publicly, so this configures LiveKit's ICE/TCP listener behind a Railway TCP proxy. Redis remains a separate Railway Redis service for room state and future horizontal scaling.

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
LIVEKIT_TURN_DOMAIN=${{livekit-turn.RAILWAY_TCP_PROXY_DOMAIN}}
LIVEKIT_TURN_PORT=${{livekit-turn.RAILWAY_TCP_PROXY_PORT}}
LIVEKIT_TURN_SECRET=${{livekit-turn.LIVEKIT_TURN_SECRET}}
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
- UDP LiveKit on a VM or Kubernetes host with open UDP ports is still faster. This setup is the best fit for Railway's networking model.
- The entrypoint resolves `RAILWAY_TCP_PROXY_DOMAIN`, advertises that IP through LiveKit `rtc.node_ip`, and forwards Railway's container TCP proxy port to LiveKit's advertised ICE/TCP port.
- LiveKit does not document an `external_tcp_port` setting, so `rtc.tcp_port` is set to Railway's external TCP proxy port and the container application port forwards to it.
- The generated config sets the UDP port range to `0..0` so Railway clients only receive TCP ICE candidates.
- `LIVEKIT_APP_WEBHOOK_URL` should point at the Esposter app's `/api/webhooks/livekit` route so participant leave and aborted connection events clean up app call state.
- `LIVEKIT_MONITOR_WEBHOOK_URL` should point at the livekit-monitor service so the monitor records room and participant events.
- `LIVEKIT_TURN_DOMAIN`, `LIVEKIT_TURN_PORT`, and `LIVEKIT_TURN_SECRET` advertise the Railway coturn TCP service as a TURN fallback.
