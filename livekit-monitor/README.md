# livekit-monitor Railway service

This folder lets Railway deploy `livekit-monitor` as a separate service from this repository. It wraps the upstream public `jossephus/livekit-monitor:v0.3.0` image with a tiny entrypoint that requires all deployment variables to be present at startup.

## Railway settings

Create a Railway service from this repo with:

- Root Directory: `livekit-monitor`
- Dockerfile Path: `Dockerfile`
- Public domain: enabled
- Volume mount: `/data`

Variables:

```text
LIVEKIT_URL=http://livekit-server.railway.internal:8080
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
PORT=3001
SQLITE_PATH=/data/monitor.db
```

The monitor stores session history in SQLite, so keep `/data` on a Railway volume.
