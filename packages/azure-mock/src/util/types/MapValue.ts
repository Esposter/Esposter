export type MapValue<BaseType> = BaseType extends Map<unknown, infer ValueType> ? ValueType : never;
