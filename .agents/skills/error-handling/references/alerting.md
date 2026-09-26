# Who alerts a tRPC rejection

Read when wiring the error path of a tRPC call — deciding whether the caller alerts, the link already did, or neither should. This page holds the whole rule; `SKILL.md` keeps the chain shapes the alert hangs off.

`errorLink` owns `BAD_REQUEST`, `TOO_MANY_REQUESTS` and `UNPROCESSABLE_CONTENT` — it alerts them itself, so a caller stays the owner only of what it alone can see (a blob PUT, a local guard). Alerting again puts two identical toasts on screen for one failure. It owns `UNAUTHORIZED` too, which only a missing session raises: it sends the caller to login with no toast, since the sign-in page says it all, and alerts the rejection itself only where it sends nobody — a background operation, or a session it could not read.

**A caller never writes that check itself** — `createErrorAlert` is the one way a caller alerts a rejection, and it asks `checkIsAnsweredByErrorLink` before reaching the alert store. Spelled out per site, the guard is a line every caller can forget, and each one that does ships a double toast nothing catches. `error-alert/no-raw-error-alert` fails the line that writes `createAlert(<expr>.message, …)`, so the only shape left to get wrong is one inside a Vue template's inline handler, which oxlint hands no JS plugin. A sentence the caller composed — a validation message, a template literal — is not a rejection and stays on `createAlert`.

```ts
createErrorAlert(error);
```

Where a surface reports through the notification store instead — the resource areas do — `createErrorNotification(error)` is the same constructor wearing that store's shape, and a caller spelling out `createNotification({ severity: NotificationSeverity.Error, title: error.message })` is restating it.

- **That ownership is unconditional, and must stay that way.** The predicate is read off the error code alone, so any operation the link quietly declines to alert is an operation _nobody_ alerts — silence on both sides. `op.context.isBackground` therefore suppresses only the **login redirect**, never the alert: a background read failing is still a failure the user's own action caused, while a background `FORBIDDEN` (an hourly sweep hitting a room the user was just removed from) must never move them.
- **The redirect reads the session rather than inferring one from the code**, and reads it from the server — `authClient.getSession()` — rather than from the client's session store, which reads pending on a fresh subscription and still signed in once the session has expired on the server. A session request that itself fails sends nobody anywhere.
- **One cause, one toast — the alert store coalesces, so nothing upstream has to.** A single rejection cause routinely rejects several operations at once (an attachment batch's file and thumbnail reads, every chunk of a paged sweep), and each arrives at `createAlert` separately. An identical alert (same text, same severity) still on screen has its dismissal refreshed instead of a second copy stacked behind it. So the fix for duplicate toasts is never to silence one of the operations — that trades a duplicate for the silence-on-both-sides failure above.
