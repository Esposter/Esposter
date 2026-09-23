FROM busybox:1.38.0-uclibc@sha256:71dfaf323216c3ac255f2cd0e418a492f70f80dc2155f0a64eff531a9caa56dd AS busybox

FROM jossephus/livekit-monitor:v0.3.0@sha256:a1ca6cf0b60eae2b250eac910bbe408d82d11096a4816ecdf198ad9064f6b543

COPY --from=busybox /bin/busybox /bin/busybox
COPY --chmod=755 entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/bin/busybox", "sh", "/entrypoint.sh"]
CMD ["/bin/livekit-monitor"]
