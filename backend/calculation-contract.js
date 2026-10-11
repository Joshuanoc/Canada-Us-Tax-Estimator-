// Money is rounded only at result boundaries, never once per tax bracket.
export const roundMoney = amount => Math.round((amount + Number.EPSILON) * 100) / 100;

// This settlement applies only to modeled income taxes. It is never a complete
// return refund: omitted credits, surtaxes and state taxes can change it.
export function settlement(withholding, modeledIncomeTax) {
  if (withholding === null) return null;
  const difference = roundMoney(withholding - modeledIncomeTax);
  return { difference, refund: Math.max(difference, 0), balanceDue: Math.max(-difference, 0), scope: 'Modeled income taxes only; not a tax return refund' };
}
