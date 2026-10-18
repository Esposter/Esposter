// A culled instance's test is taken at its position and at its top, and the view it is kept by is widened by this share
// of its own clip space, so a blade whose root lies just outside the view is not dropped while its top shows
export const CULLING_FRUSTUM_MARGIN = 0.1;
// An indirect indexed draw's arguments: the index count, the instance count, then the first index, the base vertex and
// the first instance, five unsigned integers the draw reads as they are
export const CULLING_INDIRECT_ARGUMENT_COUNT = 5;
export const CULLING_INDEX_COUNT_INDEX = 0;
export const CULLING_INSTANCE_COUNT_INDEX = 1;
// An instance smaller than this in its own size is not drawn, as one a fade has shrunk to nothing
export const CULLING_MIN_SIZE = 0.0001;
