import { Trade, Direction, SessionType } from '../types/trade';
import { calculatePips, calculateRMultiple } from './forex-math';

function determineSession(date: Date): SessionType {
  const utcHour = date.getUTCHours();
  if (utcHour >= 7 && utcHour < 12) return 'London';
  if (utcHour >= 12 && utcHour < 16) return 'Overlap';
  if (utcHour >= 16 && utcHour < 21) return 'New York';
  return 'Asian';
}

/**
 * Parses raw text from MT4/MT5 CSV or tab-delimited statement report
 */
export function parseMetaTraderCsv(csvContent: string, accountId: string = 'acc-ftmo-1'): Trade[] {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const parsedTrades: Trade[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip headers or summary rows
    if (
      line.toLowerCase().includes('ticket') ||
      line.toLowerCase().includes('balance') ||
      line.toLowerCase().includes('deposit') ||
      line.toLowerCase().includes('credit') ||
      line.toLowerCase().includes('total')
    ) {
      continue;
    }

    // Split by comma or semicolon or tab
    const cols = line.split(/[,;\t]/).map((c) => c.trim().replace(/"/g, ''));

    // MT4/MT5 CSV typical columns:
    // [0] Ticket, [1] Open Time, [2] Type (buy/sell), [3] Size (lots), [4] Item (Symbol),
    // [5] Price (Open), [6] S/L, [7] T/P, [8] Close Time, [9] Price (Close),
    // [10] Commission, [11] Taxes/Swap, [12] Profit
    if (cols.length >= 10) {
      const ticket = cols[0];
      const openTimeStr = cols[1];
      const typeStr = cols[2]?.toUpperCase();
      const sizeStr = cols[3];
      const symbol = cols[4]?.toUpperCase();
      const openPriceStr = cols[5];
      const slStr = cols[6];
      const tpStr = cols[7];
      const closeTimeStr = cols[8];
      const closePriceStr = cols[9];
      const commissionStr = cols[10] || '0';
      const swapStr = cols[11] || '0';
      const profitStr = cols[12] || '0';

      if (
        (typeStr === 'BUY' || typeStr === 'SELL') &&
        symbol &&
        openPriceStr &&
        closePriceStr
      ) {
        const direction: Direction = typeStr === 'SELL' ? 'SELL' : 'BUY';
        const lotSize = parseFloat(sizeStr) || 1.0;
        const openPrice = parseFloat(openPriceStr);
        const closePrice = parseFloat(closePriceStr);
        const stopLoss = slStr && parseFloat(slStr) > 0 ? parseFloat(slStr) : undefined;
        const takeProfit = tpStr && parseFloat(tpStr) > 0 ? parseFloat(tpStr) : undefined;
        const commission = parseFloat(commissionStr) || 0;
        const swap = parseFloat(swapStr) || 0;
        const grossPnl = parseFloat(profitStr) || 0;
        const netPnl = Number((grossPnl + commission + swap).toFixed(2));

        const closeDate = !isNaN(Date.parse(closeTimeStr)) ? new Date(closeTimeStr) : new Date();
        const openDate = !isNaN(Date.parse(openTimeStr)) ? new Date(openTimeStr) : new Date(closeDate.getTime() - 3600000);

        const pips = calculatePips(symbol, direction, openPrice, closePrice);
        const rMultiple = calculateRMultiple(direction, openPrice, closePrice, stopLoss);
        const session = determineSession(closeDate);

        parsedTrades.push({
          id: `tr-csv-${ticket}-${i}`,
          ticket,
          accountId,
          symbol,
          direction,
          lotSize,
          openPrice,
          closePrice,
          stopLoss,
          takeProfit,
          pips,
          grossPnl,
          commission,
          swap,
          netPnl,
          rMultiple,
          status: netPnl > 0 ? 'WIN' : netPnl < 0 ? 'LOSS' : 'BE',
          openTime: openDate.toISOString(),
          closeTime: closeDate.toISOString(),
          session,
          tags: [{ id: `tag-import`, name: 'Statement Import', type: 'CUSTOM' }],
          notes: `Imported from MetaTrader statement report.`,
        });
      }
    }
  }

  return parsedTrades;
}
