FROM livekit/livekit-server:v1.13.7@sha256:6fd3b7088874c4d119160dd688798dfec852bc014786d392caad15f6f63912a3 AS livekit

FROM haproxy:3.4.6@sha256:ce466230c4b6c5ad6619d06b2b11d6b5c584f0e01ed08e4252422a3e8ddf184b

COPY --from=livekit /livekit-server /usr/local/bin/livekit-server
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
