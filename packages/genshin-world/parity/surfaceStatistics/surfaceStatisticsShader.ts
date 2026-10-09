// The WGSL kernels a surface's statistics are reduced by: a separable Gaussian pass, an elementwise term, and a sum over
// The pixels. Every buffer is a flat f32 array a pixel to an element; the parameters are one uniform, read by each entry
export const SURFACE_STATISTICS_SHADER = /* wgsl */ `
struct Parameters {
  count: u32,
  width: u32,
  height: u32,
  radius: u32,
  mode: u32,
  direction: u32,
  outputOffset: u32,
  mean: f32,
}

@group(0) @binding(0) var<storage, read> blurSource: array<f32>;
@group(0) @binding(1) var<storage, read_write> blurDestination: array<f32>;
@group(0) @binding(2) var<storage, read> blurWeights: array<f32>;
@group(0) @binding(3) var<storage, read> firstValues: array<f32>;
@group(0) @binding(4) var<storage, read> secondValues: array<f32>;
@group(0) @binding(5) var<storage, read> maskValues: array<f32>;
@group(0) @binding(6) var<storage, read_write> combinedValues: array<f32>;
@group(0) @binding(7) var<storage, read> reducedValues: array<f32>;
@group(0) @binding(8) var<storage, read_write> partials: array<f32>;
@group(0) @binding(9) var<uniform> parameters: Parameters;

var<workgroup> partialSums: array<f32, 256>;

// A blur along one axis, its edges clamped, the taps centred on the pixel and weighted by the blur's own window
@compute @workgroup_size(16, 16)
fn blurPass(@builtin(global_invocation_id) identifier: vec3<u32>) {
  let x = i32(identifier.x);
  let y = i32(identifier.y);
  let width = i32(parameters.width);
  let height = i32(parameters.height);
  if (x >= width || y >= height) {
    return;
  }
  let radius = i32(parameters.radius);
  var total = 0.0;
  for (var tap = 0; tap <= 2 * radius; tap++) {
    var sampleIndex = 0;
    if (parameters.direction == 0u) {
      sampleIndex = y * width + clamp(x + tap - radius, 0, width - 1);
    } else {
      sampleIndex = clamp(y + tap - radius, 0, height - 1) * width + x;
    }
    total += blurWeights[tap] * blurSource[sampleIndex];
  }
  blurDestination[y * width + x] = total;
}

// One elementwise term a pixel: the mode says which
// 0 the product of the first and second, 1 the first over the second where the second is above zero else 0,
// 2 the mask times the squared difference of the first and second, 3 the mask times the first's squared deviation
// From the mean
@compute @workgroup_size(256)
fn combinePass(@builtin(global_invocation_id) identifier: vec3<u32>) {
  let index = identifier.x;
  if (index >= parameters.count) {
    return;
  }
  let first = firstValues[index];
  let second = secondValues[index];
  let maskValue = maskValues[index];
  var combined = 0.0;
  switch parameters.mode {
    case 0u: {
      combined = first * second;
    }
    case 1u: {
      combined = select(0.0, first / second, second > 0.0);
    }
    case 2u: {
      let difference = first - second;
      combined = maskValue * difference * difference;
    }
    case 3u: {
      let deviation = first - parameters.mean;
      combined = maskValue * deviation * deviation;
    }
    default: {}
  }
  combinedValues[index] = combined;
}

// Each workgroup sums a strided share of its input, then the workgroup's sums fold into one partial by halves
@compute @workgroup_size(256)
fn reducePass(
  @builtin(local_invocation_id) local: vec3<u32>,
  @builtin(workgroup_id) group: vec3<u32>,
  @builtin(num_workgroups) groups: vec3<u32>,
) {
  var total = 0.0;
  var index = group.x * 256u + local.x;
  let stride = groups.x * 256u;
  while (index < parameters.count) {
    total += reducedValues[index];
    index += stride;
  }
  partialSums[local.x] = total;
  workgroupBarrier();
  for (var span = 128u; span > 0u; span = span / 2u) {
    if (local.x < span) {
      partialSums[local.x] += partialSums[local.x + span];
    }
    workgroupBarrier();
  }
  if (local.x == 0u) {
    partials[parameters.outputOffset + group.x] = partialSums[0];
  }
}
`;
