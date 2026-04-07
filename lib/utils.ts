/**
 * Formats a number as currency in Kenyan Shillings (KSH).
 * @param value - The numeric value to format.
 * @param currency - The currency code, defaults to 'KSH'.
 * @returns The formatted currency string.
 */

import dayjs from "dayjs";

export function formatCurrency(
  value: number,
  currency: string = "KSH",
): string {
  try {
    // Use Intl.NumberFormat for proper currency formatting
    const formatter = new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency === "KSH" ? "KES" : currency, // Map KSH to KES for Intl
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(value);
  } catch (error) {
    // Fallback: simple formatting
    const formattedValue = value.toFixed(2);
    return `${currency} ${formattedValue}`;
  }
}

export const formartSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid()
    ? parsedDate.format("MM/DD/YYYY")
    : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
