# LiveKit TURN Railway service

This service runs coturn as a TCP-only TURN relay for the Railway-hosted LiveKit server.

Railway does not expose UDP publicly, so this service uses a Railway TCP proxy and disables TURN/UDP. LiveKit advertises this service through `rtc.turn_servers` using REST shared-secret credentials.

## Railway Setup

1. Create a Railway service from this repo.

2. Configure the service:

```text
Root Directory: livekit-turn
Dockerfile Path: Dockerfile
Replicas: 1
```

3. Set the variables:

```text
PORT=3478
TURN_REALM=esposter
LIVEKIT_TURN_SECRET=${{secret(64)}}
```

4. Add a TCP proxy with application port `3478`.

The TCP proxy's application port must be `3478`.

5. Copy the TCP proxy domain and port to the LiveKit service:

```text
LIVEKIT_TURN_DOMAIN=
LIVEKIT_TURN_PORT=
LIVEKIT_TURN_SECRET=${{livekit-turn.LIVEKIT_TURN_SECRET}}
```

`3478` is the application port entered in Railway's TCP proxy settings. `LIVEKIT_TURN_PORT` is the public port Railway assigns.
