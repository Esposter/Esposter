# Reusing Store Maps

Read when a store action receives entities another store already caches, such as users.

When a store action receives entities already cached by another store, write them through that store's own setter. Do **not** build a transient local `Map` just to look up values within the same action, and do **not** create a second parallel map ref holding the same data. `useUserStore` owns the canonical `userMap`; stores holding user-bearing lists destructure `storeUser`/`storeUsers` at their root, write members through them, and look users up at display time. One source of truth for user data.
