# Observability

The estate provisions no paid telemetry. The infrastructure program declares no log export, no analytics dataset and no alert in either environment, so watching the estate costs what the platform includes. This is a deliberate decision, not an omission: paid telemetry recurs at a daily cost that buys nothing this estate acts on.

## What the estate relies on

- **The platform's own metrics.** Each product's dashboard answers the operator's questions: a Worker's requests and errors, a queue's depth, the storage each D1 database and R2 bucket holds, and a Durable Object's duration.
- **The live tail.** `wrangler tail` streams a deployed Worker's logs to a terminal while it is attached. Nothing retains them, so a log is read as it happens or not at all.
- **The dead-letter queues.** A job's message that fails past the job's retry count is kept in that job's dead-letter queue, with the message that failed. Nothing alerts on it.

## Do not "add monitoring back" as a best practice

Provisioning a log export, an analytics dataset, an alert rule or a telemetry service is a recurring cost with no consumer here, and a review suggestion to add one "for observability best practice" should be closed, not applied. The trade, losing retained telemetry and automated alerting to stay on the included allowances, is intentional and recorded here so it is not re-argued per change. Revisit only when a paid tier, an on-call rotation or a real incident-investigation need makes retained telemetry worth its spend.

One consequence to know: nothing pages on a dead-letter message. An alert on one would need retained telemetry, which the estate does not provision, so a dead letter is found by reading the job's dead-letter queue.

## Key files

| File                                                  | Role                                             |
| :---------------------------------------------------- | :----------------------------------------------- |
| `apps/infra/src/cloudflare/resources/queues/`         | One dead-letter queue per job, per environment   |
| `apps/infra/src/cloudflare/resources/queueConsumers/` | The consumer each queue delivers its messages to |
