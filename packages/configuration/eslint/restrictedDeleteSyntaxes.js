// Every delete asks first, the undoable ones included, so a delete is never fired straight from a press. A persisted
// Removal is a `delete*`/`remove*`/`purge*`/`revoke*` call by the CRUD naming rule, which is what makes the press
// Decidable: in a template event handler or a menu item's `onClick` it is refused, and the one home left for it is a
// Confirm dialog's `:confirm`, which is a binding rather than a handler. A removal from a draft nothing has saved yet
// Takes a disable naming the draft.
const DELETE_CALLEE_REGEX = "/^(delete|purge|remove|revoke)[A-Z]/";
const message =
  "A delete asks first: open a confirm dialog (a singleton one set by a target in a dialog store for a list row) and call the delete from its `:confirm`. A removal from an unsaved draft takes a disable naming the draft.";

export default [
  {
    message,
    selector: `VAttribute[directive=true][key.name.name='on'] CallExpression[callee.name=${DELETE_CALLEE_REGEX}]`,
  },
  { message, selector: `Property[key.name='onClick'] CallExpression[callee.name=${DELETE_CALLEE_REGEX}]` },
];
