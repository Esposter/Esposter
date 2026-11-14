# Keyless auth hardening

The idea was to move the app off the keys it used for its storage, search and messaging services, onto a service principal in place of each key. Each of those keys holds a switch the security posture would turn off: storage shared-key access, blob public access, and local auth on search and messaging. The [Cloudflare program](../../../changes/infra-cloudflare-program/design.md) retires every one of those services, so there are no keys left to switch off and the idea no longer applies.

**Why not:** keyless auth meant an Entra identity, and for the app that identity came with the hosting the program leaves. Credentials stay in configuration, read from Pulumi ESC and written to each Worker's secrets by `.github/actions/put-worker-secrets/action.yaml`.
