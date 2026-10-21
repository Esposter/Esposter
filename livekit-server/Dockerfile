FROM livekit/livekit-server:v1.13.10@sha256:89ca9ce0791e18d6e03bf6e2c49ceb27e1c754eae8bd50c989386c1a5963791a AS livekit

FROM haproxy:3.4.7@sha256:abc6a6dd00d67b796f593eb11473f61fe7ba5e29c4020fa5fb7bc6cf552e7ba9

COPY --from=livekit /livekit-server /usr/local/bin/livekit-server
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
