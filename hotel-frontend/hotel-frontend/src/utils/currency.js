/**
 * Formats numeric values to Indian Rupee (INR) currency string.
 * Example: 6499 -> "₹6,499", 12500 -> "₹12,500"
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}
