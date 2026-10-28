FROM livekit/livekit-server:v1.13.11@sha256:25cd902de7cacbd5f1f779f6a6ac1eae20ba8f56b0935934ce6b0ab80d1e3d20 AS livekit

FROM haproxy:3.4.7@sha256:c36e0dc11940da71f6b6c4fb264d6d4c56f28823ad339c05c9447fe90619bc74

COPY --from=livekit /livekit-server /usr/local/bin/livekit-server
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
