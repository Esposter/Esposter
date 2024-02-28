import type { IsEqual } from "@/util/types/IsEqual";

type Filter<KeyType, ExcludeType> =
  IsEqual<KeyType, ExcludeType> extends true ? never : KeyType extends ExcludeType ? never : KeyType;

interface ExceptOptions {
  /**
	Disallow assigning non-specified properties.

	Note that any omitted properties in the resulting type will be present in autocomplete as `undefined`.

	@default false
	*/
  requireExactProps?: boolean;
}

export type Except<
  ObjectType,
  KeysType extends keyof ObjectType,
  Options extends ExceptOptions = { requireExactProps: false },
> = {
  [KeyType in keyof ObjectType as Filter<KeyType, KeysType>]: ObjectType[KeyType];
} & (Options["requireExactProps"] extends true ? Partial<Record<KeysType, never>> : NonNullable<unknown>);
