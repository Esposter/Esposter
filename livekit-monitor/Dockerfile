FROM busybox:1.36.1-uclibc@sha256:0872fb3a7632ba9d0ae46a8e832a62b30ce83a6f220b8bb52903d9cf477dabe3 AS busybox

FROM jossephus/livekit-monitor:v0.3.0@sha256:a1ca6cf0b60eae2b250eac910bbe408d82d11096a4816ecdf198ad9064f6b543

COPY --from=busybox /bin/busybox /bin/busybox
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/bin/busybox", "sh", "/entrypoint.sh"]
CMD ["/bin/livekit-monitor"]
