# Ancillary Reads

Read when a list load needs companion data — permissions, metadata — beside the page it reads.

When a component needs ancillary data (permissions, metadata) alongside a primary list load, bundle the ancillary read inside the primary read composable — not in the component's `onMounted`. An ancillary read belongs inside the composable owning the load (`useReadFoos`), called in `Promise.all` alongside other metadata reads. If there is no natural companion read, call it directly in `<script setup>` — still no `onMounted`.

```ts
// bundle ancillary reads in the owning read composable — not a separate component onMounted fetch
const readBars = useReadBars();
const readBazes = useReadBazes();
const readFoos = () =>
  readItems(async () => {
    const data = await $trpc.foo.readFoos.query();
    const fooIds = data.items.map(({ id }) => id);
    if (fooIds.length > 0) await Promise.all([readBars(fooIds), readBazes(fooIds)]);
    return data;
  });
```

Follow the `useReadBars` shape for batch ancillary reads — a composable taking an **array** of ids, early-returning when it is empty, and issuing one batched query rather than N per-id calls.
