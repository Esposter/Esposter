# Error Monitoring

An error-reporting service — Sentry, Bugsnag, Rollbar or similar — capturing unhandled client exceptions and server errors with stack traces, source maps, release tagging, grouping, and alerting. No such SDK is installed anywhere in the repo, and there is no OpenTelemetry instrumentation.

This is the **app-level** counterpart to the infrastructure decision in [Observability](../../../specs/infra/observability/design.md), whose section "Do not 'add monitoring back' as a best practice" owns the cost argument for platform telemetry. This page is about application exceptions, which a separate product would capture and which that decision does not by itself settle.

## What exists instead

Failures are printed to the console and never transmitted. The [error-handling skill](../../../../.agents/skills/error-handling/SKILL.md) owns how each failure is surfaced.

## Why deferred

- The argument is the one [Observability](../../../specs/infra/observability/design.md) makes for platform telemetry, applied one layer up: a tracker earns its place through alerting and triage across reports from users you cannot ask, and a single operator with a small user base has the console and a reproduction attempt instead.
- Error payloads carry user content: message bodies in a tRPC input, resource names, file names. Shipping them to a third party makes that vendor a data processor for the platform's private rooms, a real commitment that should be made deliberately rather than as a best-practice reflex.
- Free tiers exist, but the ongoing cost is not the invoice. An unwatched tracker fills with unactioned reports and trains everyone to ignore it.

## Revisit when

A user reports a bug that cannot be reproduced from the console — meaning the failure only exists in someone else's browser or session — or the platform gains enough real users that failures happen while nobody is looking at a log stream.

## Cheaper interim

The boundary page, `app/error.vue`, already closes the one gap worth closing without a service: an escaped error lands on ours rather than the framework's. The console handler, the production filter on the tRPC logger link and the server's `.orTee(console.error)` stay as they are. None of them transmits anything, which is the whole of what adopting a tracker would change.
