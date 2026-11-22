# Esbabbler Calls

The call row and its in-memory participant maps, the id through `createId`, standalone and room calls, the four leave boundaries, and which store owns what.

Greps over the scope, `apps/web/app/components/Message/Content/Call`, `apps/web/app/store/message/room`, `apps/web/app/composables/message/room/call`, `apps/web/app/services/message/room`, `apps/web/app/pages/calls`, `apps/web/server/services/message/call`, `apps/web/server/trpc/routers/call` and `apps/web/server/api/webhooks`:

1. `isConnecting\.value = true|isLeaving\.value` over the scope, with `*.test.ts` excluded. Each join entry sets `isConnecting` and must refuse while a leave is out, so its guard reads on the lines above it in the same function. A join entry with no `isLeaving.value` line above it is a hit.
