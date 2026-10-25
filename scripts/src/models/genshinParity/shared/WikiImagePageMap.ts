import type { WikiImagesResponse } from "#src/models/genshinParity/WikiImagesResponse";

export type WikiImagePageMap = NonNullable<NonNullable<WikiImagesResponse["query"]>["pages"]>;
