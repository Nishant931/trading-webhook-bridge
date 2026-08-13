export function getOptionSymbol(indexName: string, spotPrice: number, optionType: 'CE'|'PE', offset: 'ITM1'|'ATM'|'OTM1'): string {
  let strikePrice = spotPrice;
  const isCE = optionType === 'CE';

  if (indexName === 'NIFTY') {
    strikePrice = Math.round(spotPrice / 50) * 50;
    if (offset === 'ITM1') strikePrice += isCE ? -50 : 50;
    if (offset === 'OTM1') strikePrice += isCE ? 50 : -50;
  } else if (indexName === 'BANKNIFTY') {
    strikePrice = Math.round(spotPrice / 100) * 100;
    if (offset === 'ITM1') strikePrice += isCE ? -100 : 100;
    if (offset === 'OTM1') strikePrice += isCE ? 100 : -100;
  }

  // Example placeholder for expiry (e.g. 26AUG). In production, calculate dynamically.
  const expiry = '26AUG';
  return `${indexName}${expiry}${strikePrice}${optionType}`;
}
