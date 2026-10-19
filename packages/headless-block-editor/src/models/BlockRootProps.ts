// The props a document's root holds: the registry's root schema defines their fields, and the core reads none of them, so the constraint names none
// oxlint-disable-next-line typescript/no-empty-object-type -- any root props a consumer declares satisfy it, and the registry's root schema is what checks their fields
export interface BlockRootProps {}
