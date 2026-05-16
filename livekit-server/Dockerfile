FROM livekit/livekit-server:v1.11.0 AS livekit

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    haproxy \
    iptables \
  && rm -rf /var/lib/apt/lists/*

COPY --from=livekit /livekit-server /usr/local/bin/livekit-server
COPY --chmod=755 entrypoint.sh /entrypoint.sh

EXPOSE 8080
EXPOSE 7882

ENTRYPOINT ["/entrypoint.sh"]
