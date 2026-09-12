// What the filter bar knows about one filter type: whether its pill is showing, and how to clear every model
// The type owns when the pill is removed.
export interface ResourceListFilterTypeDefinition {
  isVisible: ComputedRef<boolean>;
  reset: () => void;
}
