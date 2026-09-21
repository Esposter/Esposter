// What the regenerating repair is pointed at: the checkout, the red head it answers, and the run whose verdict
// Named it — which goes in the commit body, because that body is the only review the repair gets
export interface MechanicalRepairInput {
  // The basis the repair records on its commit (`getRepairTrailer`)
  collectorSha: string;
  cwd: string;
  mainSha: string;
  runUrl: string;
}
