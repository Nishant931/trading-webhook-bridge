export interface WebhookPayload {
  secret_key: string;
  action: 'BUY' | 'SELL';
  symbol: string;
  index_name?: string;
  spot_price?: number;
  option_type?: 'CE' | 'PE';
  strike_offset?: 'ITM1' | 'ATM' | 'OTM1';
  stop_loss?: number;
  target?: number;
  timestamp?: string | number;
}
