# LiveKit Railway service

This service wraps the official `livekit/livekit-server:v1.11.0` image with a Railway-specific entrypoint that requires all deployment variables to be present at startup.

Railway does not expose UDP publicly, so this configures LiveKit's ICE/TCP listener behind a Railway TCP proxy. Redis remains a separate Railway Redis service for room state and future horizontal scaling.

## Railway settings

Create a Railway service from this repo with:

- Root Directory: `livekit-server`
- Dockerfile Path: `Dockerfile`
- Public domain: enabled for WebSocket/API signaling
- TCP proxy: enabled on application port `7882`
- Replicas: `1`

After creating the TCP proxy, Railway injects `RAILWAY_TCP_PROXY_DOMAIN`, `RAILWAY_TCP_PROXY_PORT`, and `RAILWAY_TCP_APPLICATION_PORT`. The entrypoint requires those variables, so create the TCP proxy before the first successful deploy or redeploy the service after the proxy exists.

Variables:

```text
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_APP_WEBHOOK_URL=
PORT=8080
LIVEKIT_LOG_LEVEL=info
LIVEKIT_MONITOR_WEBHOOK_URL=
REDIS_URL=${{Redis.REDIS_URL}}
```

`RAILWAY_TCP_PROXY_DOMAIN`, `RAILWAY_TCP_PROXY_PORT`, and `RAILWAY_TCP_APPLICATION_PORT` are required too, but Railway provides them automatically after the TCP proxy is enabled.

Use the public Railway/custom domain as your app's LiveKit URL, for example:

```text
wss://your-livekit-server.up.railway.app
```

## Notes

- Keep the first Railway deployment to a single LiveKit replica. Railway's TCP proxy assigns one public proxy port, and WebRTC ICE candidates need a stable endpoint.
- UDP LiveKit on a VM or Kubernetes host with open UDP ports is still faster. This setup is the best fit for Railway's networking model.
- The entrypoint resolves `RAILWAY_TCP_PROXY_DOMAIN`, advertises that IP through LiveKit `rtc.node_ip`, and forwards Railway's container TCP proxy port to LiveKit's advertised ICE/TCP port.
- LiveKit does not document an `external_tcp_port` setting, so `rtc.tcp_port` is set to Railway's external TCP proxy port and the container application port forwards to it.
- The generated config sets the UDP port range to `0..0` so Railway clients only receive TCP ICE candidates.
- `LIVEKIT_APP_WEBHOOK_URL` should point at the Esposter app's `/api/webhooks/livekit` route so participant leave and aborted connection events clean up app call state.
- `LIVEKIT_MONITOR_WEBHOOK_URL` should point at the livekit-monitor service so the monitor records room and participant events.
