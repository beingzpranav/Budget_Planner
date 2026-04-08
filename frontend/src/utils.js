export function formatCurrency(amount, currency = 'INR', short = false) {
  const num = Number(amount || 0);
  
  if (short && num >= 1000) {
    return `₹${(num / 1000).toFixed(0)}k`;
  }
  
  return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCurrencySymbol() {
  return '₹';
}
