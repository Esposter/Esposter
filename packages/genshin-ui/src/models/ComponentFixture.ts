// A component's states the visual suite approves: its props, the text its default slot holds, and its other states,
// Each its props over `props` by a name its image is kept under
export interface ComponentFixture {
  props: Record<string, unknown>;
  slot?: string;
  variants?: Record<string, Record<string, unknown>>;
}
