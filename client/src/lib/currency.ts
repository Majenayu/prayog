export function formatCurrency(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${numAmount.toFixed(2)}`;
}

export function formatCurrencyShort(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (numAmount >= 100000) {
    return `₹${(numAmount / 100000).toFixed(2)}L`;
  } else if (numAmount >= 1000) {
    return `₹${(numAmount / 1000).toFixed(2)}K`;
  }
  return `₹${numAmount.toFixed(2)}`;
}
