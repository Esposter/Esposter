// Vue-only, and the counterpart to `pinia/no-store-to-refs-in-store`: that rule keeps a store from reaching into
// Another store's refs through `storeToRefs`, and this one keeps a component from reaching into a store's at all.
// A store depending on a store reads its refs by dot deliberately — the binding has to stay live across a key
// Change — so the ban cannot apply to `.ts`. In a component the same dot is a ref read outside reactivity's
// Reach for anything the template later re-reads, and the two access shapes drifting apart per file is what makes
// A store's surface unreadable. Spread into both `no-restricted-syntax` and `vue/no-restricted-syntax`, since the
// Two rules scan disjoint parts of an SFC.
// Destructuring is out of reach and stays that way: `const { rooms } = roomStore` and `const { createRoom } =
// RoomStore` are the same syntax, and which one loses reactivity depends on whether the name is a ref or a method
// — a question about the store's type rather than about the shape on the page. The dot is the half that can be
// Decided from syntax alone, so it is the half that is banned.
export default [
  {
    // Lower-camel only: a `PascalCaseStore` is a plain module object rather than a `use*Store()` handle
    message:
      "Destructure a store's methods and take its refs through `storeToRefs` — a component never reads a store by dot. See the pinia skill.",
    selector: "MemberExpression[object.name=/^[a-z][A-Za-z0-9]*Store$/]",
  },
];
