export interface GoBinding {
  expression: string;
  // Whether the binding is a compound assignment, `+=` and its kin, which reads the name it writes
  isCompound: boolean;
  isDefinition: boolean;
  line: number;
}
