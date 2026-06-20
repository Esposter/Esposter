# Outbound Webhooks

Register HTTP endpoints per room; on configurable events (new message, pin, etc.) enqueue to Azure Storage Queue and have an Azure Function POST with retry/backoff.

## Why deferred

- Developer/power-user feature requiring queue + retry infrastructure.
- Low ROI for a casual social platform.

## Revisit when

There is clear integration/automation demand, and the scheduled-job queue infrastructure can be reused to deliver it cheaply.
