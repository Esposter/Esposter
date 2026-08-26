// Vue-only, and the counterpart to `pinia/no-store-to-refs-in-store`: a store depending on a store reads its refs
// By dot deliberately, since that binding has to stay live across a key change, so the ban cannot apply to `.ts`.
// Spread into both `no-restricted-syntax` and `vue/no-restricted-syntax`, since the two rules scan disjoint parts
// Of an SFC.
// Destructuring is out of reach: `const { rooms } = roomStore` and `const { createRoom } = roomStore` are the same
// Syntax, and which one loses reactivity depends on whether the name is a ref or a method — a question about the
// Store's type rather than about the shape on the page. The dot is the half decidable from syntax alone.
export default [
  {
    // Lower-camel only: a `PascalCaseStore` is a plain module object rather than a `use*Store()` handle
    message:
      "Destructure a store's methods and take its refs through `storeToRefs` — a component never reads a store by dot. See the pinia skill.",
    selector: "MemberExpression[object.name=/^[a-z][A-Za-z0-9]*Store$/]",
  },
];
