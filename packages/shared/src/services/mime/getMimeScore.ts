import {
  DEFAULT_FACET_SCORE,
  DEFAULT_SOURCE_SCORE,
  DEFAULT_TYPE_SCORE,
  FacetScoreMap,
  SourceScoreMap,
  TypeScoreMap,
} from "#src/services/mime/constants";

// The sum of a type's facet, source, top-level type and length scores. Among types claiming one extension, the
// Higher score is the more official, and a longer type is the less official, so the length term only breaks ties
export const getMimeScore = (mimeType: string, source = ""): number => {
  if (mimeType === "application/octet-stream") return 0;

  const [type = "", subtype = ""] = mimeType.split("/");
  const facet = subtype.replace(/(?<prefix>\.|x-).*/u, "$<prefix>");
  const facetScore = FacetScoreMap.get(facet) ?? DEFAULT_FACET_SCORE;
  const sourceScore = SourceScoreMap.get(source) ?? DEFAULT_SOURCE_SCORE;
  const typeScore = TypeScoreMap.get(type) ?? DEFAULT_TYPE_SCORE;
  const lengthScore = 1 - mimeType.length / 100;

  return facetScore + sourceScore + typeScore + lengthScore;
};
