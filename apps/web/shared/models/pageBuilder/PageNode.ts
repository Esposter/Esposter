import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";

// A node is Puck's ComponentData: a type tag selecting a schema, and its props. A slot is a prop holding nodes, so a
// Container's children are one more prop and a type can have any number of named regions
export interface PageNode<TType extends string = string, TProps extends PageNodeProps = PageNodeProps> {
  props: TProps;
  type: TType;
}
