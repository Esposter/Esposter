interface CreateFormPdfParameters {
  needAppearances: boolean;
}

// A one-page PDF whose text field "name" holds "Old" and has an appearance stream drawing it. The form carries
// The /NeedAppearances flag only when asked, which is the flag a reader regenerates its appearances from
export const createFormPdf = ({ needAppearances }: CreateFormPdfParameters): Uint8Array => {
  const stream = "/Tx BMC q BT /Helv 12 Tf 0 g 2 5 Td (Old) Tj ET Q EMC";
  const objects = [
    `<< /Type /Catalog /Pages 2 0 R /AcroForm << /Fields [4 0 R] /DA (/Helv 0 Tf 0 g) /DR << /Font << /Helv 5 0 R >> >>${needAppearances ? " /NeedAppearances true" : ""} >> >>`,
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 100] /Resources << /Font << /Helv 5 0 R >> >> /Annots [4 0 R] >>",
    "<< /Type /Annot /Subtype /Widget /FT /Tx /T (name) /Rect [20 40 180 60] /F 4 /P 3 0 R /V (Old) /DA (/Helv 12 Tf 0 g) /AP << /N 6 0 R >> >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Type /XObject /Subtype /Form /BBox [0 0 160 20] /Resources << /Font << /Helv 5 0 R >> >> /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.7\n";
  const offsets = objects.map((body, index) => {
    const offset = pdf.length;
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;

    return offset;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return new TextEncoder().encode(pdf);
};
