// The workgroup a pixel-wise pass runs in, one element a thread
export const SURFACE_STATISTICS_WORKGROUP_SIZE = 256;
// The square a blur pass runs in
export const SURFACE_STATISTICS_TILE_SIZE = 16;
// The workgroups a reduction runs, each leaving one partial sum for the host to add up
export const SURFACE_STATISTICS_PARTIAL_COUNT = 256;
// The uniform's size in bytes: eight 32-bit fields
export const SURFACE_STATISTICS_PARAMETERS_BYTES = 32;
// The binding the uniform parameters sit at in every entry point, after the buffers the kernels read and write
export const SURFACE_STATISTICS_PARAMETERS_BINDING = 9;
