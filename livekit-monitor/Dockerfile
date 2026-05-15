FROM busybox:1.36.1-uclibc AS busybox

FROM jossephus/livekit-monitor:v0.3.0

COPY --from=busybox /bin/busybox /bin/busybox
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/bin/busybox", "sh", "/entrypoint.sh"]
CMD ["/bin/livekit-monitor"]
