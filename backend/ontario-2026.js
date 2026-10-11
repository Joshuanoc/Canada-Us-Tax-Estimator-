// CRA T4127 January 2026, Ontario V1, V2 and S; no dependant supplement.
export function ontarioHealthPremium(income) {
  if (income <= 20000) return 0;
  if (income <= 36000) return Math.min(300, .06 * (income - 20000));
  if (income <= 48000) return Math.min(450, 300 + .06 * (income - 36000));
  if (income <= 72000) return Math.min(600, 450 + .25 * (income - 48000));
  if (income <= 200000) return Math.min(750, 600 + .25 * (income - 72000));
  return Math.min(900, 750 + .25 * (income - 200000));
}
export function ontarioAdjustments(basicTax, income) {
  const surtax = Math.max(basicTax - 5818, 0) * .20 + Math.max(basicTax - 7446, 0) * .36;
  const beforeReduction = basicTax + surtax;
  const reduction = Math.max(0, Math.min(beforeReduction, 600 - beforeReduction));
  const healthPremium = ontarioHealthPremium(income);
  return { surtax, reduction, healthPremium, total: beforeReduction - reduction + healthPremium };
}
