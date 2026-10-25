FROM livekit/livekit-server:v1.13.11@sha256:25cd902de7cacbd5f1f779f6a6ac1eae20ba8f56b0935934ce6b0ab80d1e3d20 AS livekit

FROM haproxy:3.4.7@sha256:abc6a6dd00d67b796f593eb11473f61fe7ba5e29c4020fa5fb7bc6cf552e7ba9

COPY --from=livekit /livekit-server /usr/local/bin/livekit-server
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
