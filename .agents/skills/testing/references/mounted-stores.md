# Stores Behind a Mounted Component

Read when a mounted component reads a store the test seeds — through `mountSuspended`, a plain `mount`, or a room-scoped store.

## The nuxt environment has one Pinia — the app's, emptied before every test

`shared/test/setup.ts` disposes every store in the app's own Pinia and re-activates it before each nuxt-environment
test, so a store resolved anywhere — before a mount, after it, inside a tRPC link — is the one the component injects.
A suite there never calls `setActivePinia(createPinia())`. The trap it replaces is not derivable from any one file:
every Pinia action re-activates the Pinia its store belongs to, and the app runs actions on its own stores whenever it
likes — the recent-pages plugin on unhead's deferred `dom:rendered` and on every router `afterEach` — so a second Pinia
of the suite's own is swapped out mid-test, and every store resolved after that (the suite's own, or the error link's
alert store) lands in the app's. It shows only under parallel load, as the first test of a file failing with its
route intact. A test that needs a second Pinia on purpose creates it inside that test.

## A plain `mount` has no Pinia — give it one once the component reaches a store

A happy-dom suite mounting with `@vue/test-utils` runs no Nuxt app, so there is no active Pinia, and a component
whose setup reaches a store — directly, or through a primitive that does, as `useMutation` reads the cache store —
throws `getActivePinia()` at mount. `beforeEach(() => { setActivePinia(createPinia()); })` gives it one. The
change that makes a library component reach a store owes this to every happy-dom suite that mounts it or a wrapper
of it. The nuxt environment is the opposite case ("The nuxt environment has one Pinia — the app's, emptied before every test", on this page).

## A room-scoped store has no state until a room is current — `setCurrentRoomId`

Every room-scoped store keys its state by the room id in the route, so before one is set the store's maps are empty and any assertion against them passes vacuously. Two things make the obvious assignment silently do nothing, which is why this is a shared helper (`app/services/message/room/setCurrentRoomId.test.ts`) rather than a line each test writes:

- **Mounting resets the route**, so the id has to be set _after_ `mountSuspended`, not in a `beforeEach` above it.
- **`router.currentRoute` is a `shallowRef`**, so writing `params.id` into the existing params object mutates a value nothing is tracking. The helper's `triggerRef` is what makes the computed re-read.

```ts
const wrapper = await mountSuspended(Foo);
setCurrentRoomId(roomId); // after the mount, and never a bare `currentRoute.value.params.id = roomId`
```
