# livekit-monitor Railway service

Use this folder to deploy `livekit-monitor` to Railway as a separate service from this repository. It wraps the public upstream image `jossephus/livekit-monitor` with an entrypoint that requires every deployment variable at startup.

## Railway settings

Warning: the monitor stores session history in SQLite under `/data`. Keep `/data` on a Railway volume, so the history persists.

Create a Railway service from this repository with these settings:

- Root Directory: `livekit-monitor`
- Dockerfile Path: `Dockerfile`
- Public domain: enabled
- Volume mount: `/data`

Set these variables:

```text
LIVEKIT_URL=http://${{livekit-server.RAILWAY_PRIVATE_DOMAIN}}:${{livekit-server.PORT}}
LIVEKIT_API_KEY=${{livekit-server.LIVEKIT_API_KEY}}
LIVEKIT_API_SECRET=${{livekit-server.LIVEKIT_API_SECRET}}
PORT=3001
SQLITE_PATH=/data/monitor.db
```

Check: the deploy logs have no line that starts with `ERROR:`.
