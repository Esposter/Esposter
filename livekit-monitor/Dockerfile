FROM busybox:1.38.0-uclibc@sha256:ddb91a9b37968119844068ea623ee9603f34ad384e2bd9739b9cf573d513c691 AS busybox

FROM jossephus/livekit-monitor:v0.3.0@sha256:a1ca6cf0b60eae2b250eac910bbe408d82d11096a4816ecdf198ad9064f6b543

COPY --from=busybox /bin/busybox /bin/busybox
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/bin/busybox", "sh", "/entrypoint.sh"]
CMD ["/bin/livekit-monitor"]
