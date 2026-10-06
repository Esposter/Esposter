FROM livekit/livekit-server:v1.13.7@sha256:6fd3b7088874c4d119160dd688798dfec852bc014786d392caad15f6f63912a3 AS livekit

FROM haproxy:3.4.6@sha256:e273915691a8eab3f105bf3e39fd4c29a4ecf334e33421903b5589d25e14db26

COPY --from=livekit /livekit-server /usr/local/bin/livekit-server
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
