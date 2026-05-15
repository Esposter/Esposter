# LiveKit Railway service

This service wraps the official `livekit/livekit-server` image with a Railway-specific entrypoint.

Railway does not expose UDP publicly, so this runs LiveKit in a TCP-friendly mode and uses a Railway TCP proxy for WebRTC ICE media. Redis remains a separate Railway Redis service for room state and future horizontal scaling.

## Railway settings

Create a Railway service from this repo with:

- Root Directory: `livekit-server`
- Dockerfile Path: `Dockerfile`
- Public domain: enabled for WebSocket/API signaling
- TCP proxy: enabled on application port `7882`
- Replicas: `1`

After creating the TCP proxy, Railway injects `RAILWAY_TCP_PROXY_DOMAIN`, `RAILWAY_TCP_PROXY_PORT`, and `RAILWAY_TCP_APPLICATION_PORT`. Redeploy the service after the proxy exists.

Variables:

```text
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
PORT=8080
LIVEKIT_NODE_IP_MODE=proxy
LIVEKIT_LOG_LEVEL=info
LIVEKIT_MONITOR_WEBHOOK_URL=http://livekit-monitor.railway.internal:3001/api/webhook
REDIS_URL=${{Redis.REDIS_URL}}
```

Use the public Railway/custom domain as your app's LiveKit URL, for example:

```text
wss://your-livekit-server.up.railway.app
```

## Notes

- Keep the first Railway deployment to a single LiveKit replica. Railway's TCP proxy assigns one public proxy port, and WebRTC ICE candidates need a stable endpoint.
- UDP LiveKit on a VM or Kubernetes host with open UDP ports is still faster. This setup is the best fit for Railway's networking model.
