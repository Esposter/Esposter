// Two signals' pitch agreement as they stand, and the lag in frames within a bound that agrees best with that
// Agreement, positive where the first sounds late
export interface LaggedAgreement {
  agreement: number;
  lag: number;
  lagAgreement: number;
}
