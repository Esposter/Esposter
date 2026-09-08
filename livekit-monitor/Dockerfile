FROM busybox:1.38.0-uclibc@sha256:297dda192bda2157ddf40abb47a45a1090caff1864db9cfb9ce4b901ba318a3c AS busybox

FROM jossephus/livekit-monitor:v0.3.0@sha256:a1ca6cf0b60eae2b250eac910bbe408d82d11096a4816ecdf198ad9064f6b543

COPY --from=busybox /bin/busybox /bin/busybox
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/bin/busybox", "sh", "/entrypoint.sh"]
CMD ["/bin/livekit-monitor"]
