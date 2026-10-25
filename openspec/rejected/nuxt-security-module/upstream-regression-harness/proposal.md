# Upstream regression harness

## Why

Rejected — running the needs-app regression tests against the upstream nuxt-security 2.6.0 package, to watch each one fail there before it passes against the module. The owner decided against the harness: the module's own regression suite already exercises the package the app runs, so it stands in for the harness.
