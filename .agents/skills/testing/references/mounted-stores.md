# Stores Behind a Mounted Component

Read when a mounted component reads a store the test seeds — through `mountSuspended`, a plain `mount`, or a room-scoped store.

## A mounted component's store is the nuxt app's pinia — resolve it after the mount

`mountSuspended` mounts into the nuxt app's own pinia, so a `useFooStore()` called before it — or after a
`createPinia()` of the test's own — hands back a different instance from the one the component injected. Seeding
that one changes nothing on screen and every assertion against it passes vacuously. Resolve the store after the
mount and seed it there, the same ordering `setCurrentRoomId` needs, below, and for the same reason.

```ts
const wrapper = await mountSuspended(Foo);
const fooStore = useFooStore();
fooStore.bar = value;
await nextTick();
```

## A plain `mount` has no Pinia — give it one once the component reaches a store

A happy-dom suite mounting with `@vue/test-utils` runs no Nuxt app, so there is no active Pinia, and a component
whose setup reaches a store — directly, or through a primitive that does, as `useMutation` reads the cache store —
throws `getActivePinia()` at mount. `beforeEach(() => { setActivePinia(createPinia()); })` gives it one. The
change that makes a library component reach a store owes this to every happy-dom suite that mounts it or a wrapper
of it. The nuxt environment is the opposite case, above: its app already carries a Pinia, and a second one of the
test's own is the vacuous-assertion trap.

## A room-scoped store has no state until a room is current — `setCurrentRoomId`

Every room-scoped store keys its state by the room id in the route, so before one is set the store's maps are empty and any assertion against them passes vacuously. Two things make the obvious assignment silently do nothing, which is why this is a shared helper (`app/services/message/room/setCurrentRoomId.test.ts`) rather than a line each test writes:

- **Mounting resets the route**, so the id has to be set _after_ `mountSuspended`, not in a `beforeEach` above it.
- **`router.currentRoute` is a `shallowRef`**, so writing `params.id` into the existing params object mutates a value nothing is tracking. The helper's `triggerRef` is what makes the computed re-read.

```ts
const wrapper = await mountSuspended(Foo);
setCurrentRoomId(roomId); // after the mount, and never a bare `currentRoute.value.params.id = roomId`
```
