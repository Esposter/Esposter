FROM livekit/livekit-server:v1.13.9@sha256:d0c04791bf63ca8dcea123571827d56ba9504bd57c8d5de60ee03b5408cc3154 AS livekit

FROM haproxy:3.4.6@sha256:e273915691a8eab3f105bf3e39fd4c29a4ecf334e33421903b5589d25e14db26

COPY --from=livekit /livekit-server /usr/local/bin/livekit-server
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
