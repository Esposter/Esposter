// A slot with its row type erased, the one form every table's slot takes in a map. `table` is the identity a typed
// Slot is recovered by, since no parameter names a row type
export interface ErasedSlot {
  table: object;
}
