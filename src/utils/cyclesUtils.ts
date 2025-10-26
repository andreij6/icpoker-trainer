/**
 * Utility functions for managing ICP cycles in the poker trainer.
 * 
 * Economy Model:
 * - 1 trillion cycles = 100 hands of gameplay
 * - Cost per hand = 10 billion cycles
 * - 1 trillion cycles = 1 XDR (≈ $1.35 USD)
 */

/** Cost in cycles for one hand of poker */
export const CYCLES_PER_HAND = 10_000_000_000; // 10 billion cycles

/** Number of hands per trillion cycles */
export const HANDS_PER_TRILLION = 100;

/** One trillion cycles */
export const CYCLES_PER_TRILLION = 1_000_000_000_000;

/** Starting cycles balance for new users (10 trillion = 1,000 hands) */
export const STARTING_CYCLES_BALANCE = 10_000_000_000_000; // 10 trillion cycles

/**
 * Convert cycles to number of hands available
 * @param cycles The number of cycles
 * @returns The number of hands that can be played
 */
export function cyclesToHands(cycles: number): number {
  return Math.floor(cycles / CYCLES_PER_HAND);
}

/**
 * Convert number of hands to cycles cost
 * @param hands The number of hands
 * @returns The cost in cycles
 */
export function handsToCycles(hands: number): number {
  return hands * CYCLES_PER_HAND;
}

/**
 * Format cycles for display (e.g., "5.2T", "750B")
 * @param cycles The number of cycles
 * @returns Formatted string with appropriate suffix
 */
export function formatCycles(cycles: number): string {
  if (cycles >= CYCLES_PER_TRILLION) {
    const trillions = cycles / CYCLES_PER_TRILLION;
    return `${trillions.toFixed(1)}T`;
  } else if (cycles >= 1_000_000_000) {
    const billions = cycles / 1_000_000_000;
    return `${billions.toFixed(1)}B`;
  } else if (cycles >= 1_000_000) {
    const millions = cycles / 1_000_000;
    return `${millions.toFixed(1)}M`;
  }
  return cycles.toLocaleString();
}

/**
 * Deduct the cost of one hand from the cycles balance
 * @param currentBalance The current cycles balance
 * @returns The new balance after deduction
 */
export function deductHandCost(currentBalance: number): number {
  return Math.max(0, currentBalance - CYCLES_PER_HAND);
}

/**
 * Check if user has enough cycles to play a hand
 * @param cyclesBalance The current cycles balance
 * @returns True if user can play at least one more hand
 */
export function canPlayHand(cyclesBalance: number): boolean {
  return cyclesBalance >= CYCLES_PER_HAND;
}

/**
 * Calculate the USD cost per hand based on current XDR rate
 * @param xdrToUsd Current XDR to USD exchange rate (default: 1.354820)
 * @returns Cost per hand in USD
 */
export function costPerHandUSD(xdrToUsd: number = 1.354820): number {
  // 1 trillion cycles = 1 XDR
  // Cost per hand = 10 billion cycles = 0.01 XDR
  const xdrPerHand = CYCLES_PER_HAND / CYCLES_PER_TRILLION;
  return xdrPerHand * xdrToUsd;
}

/**
 * Convert USD to cycles based on current XDR rate
 * @param usd Amount in USD
 * @param xdrToUsd Current XDR to USD exchange rate (default: 1.354820)
 * @returns Number of cycles
 */
export function usdToCycles(usd: number, xdrToUsd: number = 1.354820): number {
  // $1 USD = (1 / xdrToUsd) XDR
  // 1 XDR = 1 trillion cycles
  const xdr = usd / xdrToUsd;
  return Math.floor(xdr * CYCLES_PER_TRILLION);
}

/**
 * Convert cycles to USD based on current XDR rate
 * @param cycles Number of cycles
 * @param xdrToUsd Current XDR to USD exchange rate (default: 1.354820)
 * @returns Amount in USD
 */
export function cyclesToUSD(cycles: number, xdrToUsd: number = 1.354820): number {
  // 1 trillion cycles = 1 XDR
  const xdr = cycles / CYCLES_PER_TRILLION;
  return xdr * xdrToUsd;
}

