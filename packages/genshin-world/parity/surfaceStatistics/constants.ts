// The workgroup a pixel-wise pass runs in, one element a thread
export const SURFACE_STATISTICS_WORKGROUP_SIZE = 256;
// The square a blur pass runs in
export const SURFACE_STATISTICS_TILE_SIZE = 16;
// The workgroups a reduction runs, each leaving one partial sum for the host to add up
export const SURFACE_STATISTICS_PARTIAL_COUNT = 256;
// The uniform's size in bytes: nine 32-bit fields, padded to a multiple of sixteen
export const SURFACE_STATISTICS_PARAMETERS_BYTES = 48;
// The binding the uniform parameters sit at in every entry point, after the buffers the kernels read and write
export const SURFACE_STATISTICS_PARAMETERS_BINDING = 9;
// The weight of each scale of a label's similarity, finest first (Wang, Simoncelli and Bovik, 2003)
export const LABEL_SIMILARITY_SCALE_WEIGHTS = [0.0448, 0.2856, 0.3001, 0.2363, 0.1333];
// The Gaussian window a label's similarity is measured through, at each scale
export const LABEL_SIMILARITY_WINDOW_SIGMA = 1.5;
