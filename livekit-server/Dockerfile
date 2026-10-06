FROM livekit/livekit-server:v1.13.8@sha256:ad961c9b4b064298cc08d618d772671f7c783e036001388079fa813929cc357e AS livekit

FROM haproxy:3.4.6@sha256:e273915691a8eab3f105bf3e39fd4c29a4ecf334e33421903b5589d25e14db26

COPY --from=livekit /livekit-server /usr/local/bin/livekit-server
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
