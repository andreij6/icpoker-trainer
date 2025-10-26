# ICP Cycles Economy for Poker Trainer

## Overview
This poker trainer application uses the Internet Computer Protocol (ICP) cycles as its in-game currency. Users convert ICP tokens to cycles to play hands of poker.

## ICP to Cycles Conversion

### Conversion Rate
- **1 trillion cycles = 1 XDR** (Special Drawing Right)
- **1 XDR ≈ $1.35 USD** (as of current exchange rates)
- **$1 USD ≈ 737.5 billion cycles**

### Calculation Examples
```
1 ICP token (≈ $3.14 USD) = ~2.3 trillion cycles
$10 USD = ~7.375 trillion cycles
$100 USD = ~73.75 trillion cycles
```

## Game Economy

### Cost Per Hand
- **1 trillion cycles = 100 hands of gameplay**
- **Cost per hand = 10 billion cycles**

### Example Gameplay Costs
```
1 trillion cycles     = 100 hands
5 trillion cycles     = 500 hands
10 trillion cycles    = 1,000 hands
100 trillion cycles   = 10,000 hands
```

### Dollar Cost Per Hand
```
Cost per hand = 10 billion cycles
10 billion cycles ≈ $0.0135 USD per hand
```

## UI Display

### Current Balance Display
- **Cycles Balance**: Shows remaining cycles (e.g., "5.2T cycles")
- **Hands Left**: Shows number of hands user can play (cycles ÷ 10 billion)

### Deduction Logic
After each completed hand:
1. Subtract 10 billion cycles from balance
2. Recalculate hands left: `Math.floor(cycles / 10_000_000_000)`
3. Update UI display

### Zero Balance Behavior
When hands left reaches 0:
- Disable gameplay
- Show "Add Cycles" prompt
- Redirect to cycles purchase/conversion flow

## Technical Implementation

### Constants
```typescript
const CYCLES_PER_HAND = 10_000_000_000; // 10 billion cycles
const HANDS_PER_TRILLION = 100;
const CYCLES_PER_TRILLION = 1_000_000_000_000; // 1 trillion
```

### Conversion Functions
```typescript
// Convert cycles to hands
function cyclesToHands(cycles: number): number {
  return Math.floor(cycles / CYCLES_PER_HAND);
}

// Convert hands to cycles
function handsToCycles(hands: number): number {
  return hands * CYCLES_PER_HAND;
}

// Format cycles for display (e.g., "5.2T")
function formatCycles(cycles: number): string {
  if (cycles >= 1_000_000_000_000) {
    return `${(cycles / 1_000_000_000_000).toFixed(1)}T`;
  } else if (cycles >= 1_000_000_000) {
    return `${(cycles / 1_000_000_000).toFixed(1)}B`;
  }
  return cycles.toLocaleString();
}
```

## Future Enhancements

### Planned Features
1. **Cycles Purchase Flow**: Integration with ICP wallet for cycles conversion
2. **Subscription Model**: Monthly cycles packages at discounted rates
3. **Bonus Cycles**: Reward active players with bonus cycles
4. **Tournament Mode**: Special cycle rates for tournament play
5. **Referral System**: Earn cycles by referring new players

### Analytics Tracking
- Track average cycles spent per session
- Monitor hand completion rates
- Analyze user spending patterns
- Optimize pricing based on engagement

## Exchange Rate Updates

### Current Rates (Updated: October 25, 2025)
- 1 XDR = $1.354820 USD
- 1 ICP = $3.14 USD
- $1 USD = 737.5 billion cycles

### Rate Sources
- **XDR Rates**: [IMF Official XDR Data](https://www.imf.org/external/np/fin/data/rms_sdrv.aspx)
- **ICP Price**: [CoinMarketCap](https://coinmarketcap.com/currencies/internet-computer/)
- **Cycles Documentation**: [Internet Computer Docs](https://internetcomputer.org/docs/references/cycles-cost-formulas)

### Update Frequency
Exchange rates should be updated:
- **XDR/USD**: Daily (IMF publishes daily rates)
- **ICP/USD**: Real-time (crypto markets)
- **Game pricing**: Monthly review to maintain stable USD-equivalent costs

## Notes

- The reverse gas model means developers (us) pre-pay for computation
- Users pay in cycles for gameplay, not for blockchain transaction fees
- Cycle costs remain stable even when ICP token price fluctuates
- All cycle deductions happen instantly with no blockchain confirmation delays

