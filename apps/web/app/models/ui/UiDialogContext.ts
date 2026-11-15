// What the dialog a component stands in offers the commands drawn for it: whether it can stand over the whole page, whether
// It does, and whether it is open
export interface UiDialogContext {
  isExpandable: Readonly<Ref<boolean>>;
  isExpanded: Ref<boolean>;
  isOpen: Ref<boolean>;
}
