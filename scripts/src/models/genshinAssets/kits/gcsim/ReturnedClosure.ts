// A closure a function returns, `return func(a info.AttackCB) {` ... `}`, runs where the value it returns is called, so a
// Queue call in it takes the delay of the call that schedules that value, or none where no call schedules it
export interface ReturnedClosure {
  bodyEnd: number;
  bodyStart: number;
}
