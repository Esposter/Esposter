// Bytes of a stderr buffer sampled to recognise its encoding — enough for the shortest diagnostic, cheap for a
// Multi-megabyte one.
const STDERR_SAMPLE_BYTES = 64;
// Which encoding a failed child really wrote its stderr in, detected rather than declared: a call site that has to
// Remember "this one is utf16le" eventually forgets, and every WSL launch failure then reads as a bare "Command
// Failed:". UTF-16LE ASCII text pads every character with a trailing NUL,
// A shape utf8 text never has, so the padding identifies itself. Text outside ASCII (a localized wsl.exe) carries no
// Such padding and still reads back as utf8 — undetectable here, and no worse than declaring the encoding wrongly.
// A capture cut mid-character (a timeout kill, a maxBuffer cut) may end on an odd byte; the sample still identifies
// The padding and the decoder drops the dangling byte, instead of falling back to utf8 and NUL-interleaved garbage.
export const getStderrEncoding = (stderr: Buffer): BufferEncoding => {
  if (stderr.length < 2) return "utf8";
  const sample = stderr.subarray(0, STDERR_SAMPLE_BYTES);
  const isNulPadded = sample.every((byte, index) => index % 2 === 0 || byte === 0);
  return isNulPadded && sample.some((byte, index) => index % 2 === 0 && byte > 0) ? "utf16le" : "utf8";
};
