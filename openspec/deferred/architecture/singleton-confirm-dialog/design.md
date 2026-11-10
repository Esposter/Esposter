# Singleton confirm dialog

One component for the delete confirm a list mounts behind a `v-if`, with the lookup that resolves its item from the list's target. Each list writes both by hand today, as the [singleton dialogs](../../../specs/architecture/singleton-dialogs/design.md) standard describes.

## Why deferred

The repeated part is the business logic, not the markup. Which item a confirm resolves, when it clears its target, how a selection's delete resolves the rows still present and holds them through the leave, and what a failed delete does are rules the standard fixes and every list follows. A component that takes them over decides those rules for every list at once, so it is a change with a design of its own and tests of its own, not a pass over the containers.

## Revisit when

A confirm's rule changes, such as its pending state, its cancel path or what clears its target, and that change has to land at each list in the same edit. Or one list is found following the standard differently from the rest. Either is the point where the rule wants one owner.

## Cheaper interim

The standard already holds the rules, and `apps/web/app/components/Post/ConfirmDeleteDialog.vue` is its canonical example to copy from.
