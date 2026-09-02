# Who alerts a tRPC rejection

Read when wiring the error path of a tRPC call — deciding whether the caller alerts, the link already did, or neither should. This page holds the whole rule; `SKILL.md` keeps the chain shapes the alert hangs off.

`errorLink` owns `BAD_REQUEST`, `TOO_MANY_REQUESTS` and `UNPROCESSABLE_CONTENT` — it alerts them itself, so a caller stays the owner only of what it alone can see (a blob PUT, a local guard). Alerting again puts two identical toasts on screen for one failure.

**A caller never writes that check itself** — `createErrorAlert` is the one way a caller alerts a rejection, and it asks `checkIsAlertedByErrorLink` before reaching the alert store. Spelled out per site, the guard is a line four callers can each forget, and each one that does ships a double toast nothing catches. `error-alert/no-raw-error-alert` fails the line that writes `createAlert(<expr>.message, …)`, so the only shape left to get wrong is one inside a Vue template's inline handler, which oxlint hands no JS plugin. A sentence the caller composed — a validation message, a template literal — is not a rejection and stays on `createAlert`.

```typescript
createErrorAlert(error);
```

Where a surface reports through the notification store instead — the resource areas do — `createErrorNotification(error)` is the same constructor wearing that store's shape, and a caller spelling out `createNotification({ severity: NotificationSeverity.Error, title: error.message })` is restating it.

- **That ownership is unconditional, and must stay that way.** The predicate is read off the error code alone, so any operation the link quietly declines to alert is an operation _nobody_ alerts — silence on both sides. `op.context.isBackground` therefore suppresses only the **login redirect**, never the alert: a background read failing is still a failure the user's own action caused, while a background `FORBIDDEN` (an hourly sweep hitting a room the user was just removed from) must never move them.
- **The redirect reads the session rather than inferring one from the code**, and only once the session request has **settled** — `authClient.useSession()` outside a component returns `data: null` while pending, and redirecting on that logs an authenticated user out of the first page load that happens to reject. It reads it inside an `effectScope` the link stops: better-auth's `useStore` registers its unsubscribe through `onScopeDispose`, so a bare call in the link's promise leaves a listener on the module-singleton session atom per rejection.
- **One cause, one toast — the alert store coalesces, so nothing upstream has to.** A single rejection cause routinely rejects several operations at once (an attachment batch's file and thumbnail reads, every chunk of a paged sweep), and each arrives at `createAlert` separately. An identical alert (same text, same severity) still on screen has its dismissal refreshed instead of a second copy stacked behind it. So the fix for duplicate toasts is never to silence one of the operations — that trades a duplicate for the silence-on-both-sides failure above.
