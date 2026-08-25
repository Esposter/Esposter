---
title: Error monitoring
description: Deferred — shipping client and server exceptions to an error tracker instead of the console.
---

# Error Monitoring

An error-reporting service — Sentry, Bugsnag, Rollbar or similar — capturing unhandled client exceptions and server errors with stack traces, source maps, release tagging, grouping, and alerting. No such SDK is installed anywhere in the repo, and there is no OpenTelemetry instrumentation.

This is the **app-level** counterpart to a decision already recorded on the infrastructure side: [Observability](/docs/infra/observability) explains why Application Insights and Log Analytics are deliberately not provisioned. That page owns the cost argument for platform telemetry; this one is about application exceptions, which a separate product would capture and which that decision does not by itself settle.

## What exists instead

Errors are surfaced, just never collected:

- `app/plugins/errorHandler.ts` hooks Nuxt's `vue:error` and writes the error to the console with its `info` string. Every error, with nothing filtered — an offline failure prints like any other, because a console that silently drops one class of error can no longer be read as evidence that nothing failed. That is the whole global client handler — nothing is transmitted anywhere.
- `app/plugins/warnHandler.ts` wraps Vue's `warnHandler` to suppress one known-benign slot warning, so real warnings stay visible in development.
- The tRPC link stack in `app/plugins/trpc.ts` splits the two jobs a failed call has. `loggerLink` is configured to stay quiet in production **except** for down-direction results that are `Error` instances, so a failing procedure still prints. `errorLink` is the user-facing half — it raises the alert the person actually sees, and an offline failure carries no `data` shape, so it never reaches the alert. Nothing suppresses it anywhere else: it reaches the console as an unhandled rejection like every other failed call.
- Server-side, failures reach the console through the neverthrow convention — a chain that can fail terminates in `.orTee(console.error)` rather than swallowing. Those writes land in the host's log stream and nowhere durable.

There is also **no `app/error.vue`**, so an error that escapes to the boundary renders Nuxt's default error page rather than anything of ours.

## Why deferred

- A tracker's value is alerting and triage across a stream of reports from users you cannot ask. With a single operator and a small user base, the console in front of you and a reproduction attempt answer the same question at zero cost — the same "no consumer for the telemetry" argument the infra decision makes, applied one layer up.
- Error payloads carry user content: message bodies in a tRPC input, resource names, file names. Shipping them to a third party makes that vendor a data processor for the platform's private rooms — a real commitment, not a config line, and one that should be made deliberately rather than as a best-practice reflex.
- Free tiers exist, but the ongoing cost is not the invoice; it is that an unwatched tracker fills with unactioned reports and trains everyone to ignore it.

## Revisit when

A user reports a bug that cannot be reproduced from the console — meaning the failure only exists in someone else's browser or session — or the platform gains enough real users that failures happen while nobody is looking at a log stream.

## Cheaper interim

Adding an `app/error.vue` boundary page costs nothing, needs no service, and is the one gap worth closing first: it turns an escaped error into a branded page with a way back into the app instead of the framework default. Everything else stays as it is — the console handler, the `loggerLink` production filter, and `.orTee(console.error)` on the server.
