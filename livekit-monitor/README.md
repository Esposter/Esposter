# livekit-monitor Railway service

This folder lets Railway deploy `livekit-monitor` as a separate service from this repository. The Docker image is the upstream public image from `jossephus/livekit-monitor`.

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
