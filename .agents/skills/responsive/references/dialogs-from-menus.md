# Dialogs Opened From a Menu

Read when an overflow-menu item opens a dialog.

A dialog mounted inside a menu's list is destroyed when the menu closes, so it never opens. Mount the dialog in the **toolbar** component and have the menu item flip its model, as the resource page's header does (`apps/web/app/components/Resource/Blade/Header.vue`):

```vue
<UiOverflowMenu :items label="Resource actions" />
<ResourceRenameDialog v-if="isRenameOpen" v-model="isRenameOpen" :rename="renameResource" :resource />
```

Mounting with `v-if` alongside `v-model` (rather than keeping it mounted) means the dialog's fields re-initialise from the current props on every open — no `watch` to reset them.
