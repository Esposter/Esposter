# Drift detection

A scheduled CI job running `pulumi refresh --preview-only` and alerting when live Cloudflare and GitHub state diverges from the Pulumi program.

## Why not

CI already runs the Pulumi preview on every push to `ai/queue` that touches the infrastructure, so the estate is checked where changes are made. A scheduled job is a second workflow and a second place that holds Cloudflare and Pulumi credentials, built beside a check that already runs.

If an out-of-band change ever needs catching, the preview refreshing state is the whole of it, with no job of its own to schedule and authenticate. Nothing here has asked for that, so nothing is built.
