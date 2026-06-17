import { Asset } from '../types';

// Helper to generate realistic historical price feed
const generateHistory = (currentPrice: number, points = 30): { time: string; price: number }[] => {
  const history: { time: string; price: number }[] = [];
  let basePrice = currentPrice * 0.98;
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    const timeValue = new Date(now.getTime() - i * 60 * 1000); // 1 minute intervals
    const randomChange = (Math.random() - 0.49) * 0.01 * basePrice; // slight volatility
    basePrice += randomChange;
    
    history.push({
      time: timeValue.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price: parseFloat(basePrice.toFixed(2))
    });
  }
  return history;
};

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC/AOA',
    name: 'Bitcoin',
    category: 'currencies',
    price: 61640000.00, // $67,000 * 920 AOA
    previousPrice: 61000000.00,
    changePercent: 1.05,
    history: [],
    description: 'A criptomoeda pioneira e o maior ativo digital descentralizado do mundo.',
    volume: '2.5B AOA',
    high: 62100000.00,
    low: 60500000.00
  },
  {
    id: 'ethereum',
    symbol: 'ETH/AOA',
    name: 'Ethereum',
    category: 'currencies',
    price: 3220000.00, // $3,500 * 920 AOA
    previousPrice: 3250000.00,
    changePercent: -0.92,
    history: [],
    description: 'Plataforma descentralizada inovadora que permite smart contracts e dApps globais.',
    volume: '1.2B AOA',
    high: 3280000.00,
    low: 3190000.00
  },
  {
    id: 'solana',
    symbol: 'SOL/AOA',
    name: 'Solana',
    category: 'currencies',
    price: 138000.00, // $150 * 920 AOA
    previousPrice: 134000.00,
    changePercent: 2.98,
    history: [],
    description: 'Blockchain de altíssima velocidade e taxas extremamente baixas para transações e DeFi.',
    volume: '450M AOA',
    high: 139500.00,
    low: 131000.00
  },
  {
    id: 'binance-coin',
    symbol: 'BNB/AOA',
    name: 'BNB',
    category: 'currencies',
    price: 533600.00, // $580 * 920 AOA
    previousPrice: 529000.00,
    changePercent: 0.87,
    history: [],
    description: 'Criptomoeda de utilidade nativa que alimenta o ecossistema Binance Smart Chain.',
    volume: '320M AOA',
    high: 538000.00,
    low: 525000.00
  },
  {
    id: 'ripple',
    symbol: 'XRP/AOA',
    name: 'Ripple',
    category: 'others',
    price: 460.00, // $0.50 * 920 AOA
    previousPrice: 470.00,
    changePercent: -2.12,
    history: [],
    description: 'Rede global de liquidação financeira e transações rápidas focada em grandes instituições.',
    volume: '95M AOA',
    high: 475.00,
    low: 452.00
  },
  {
    id: 'cardano',
    symbol: 'ADA/AOA',
    name: 'Cardano',
    category: 'others',
    price: 414.00, // $0.45 * 920 AOA
    previousPrice: 410.00,
    changePercent: 0.97,
    history: [],
    description: 'Blockchain académica de terceira geração focada em segurança extrema e sustentabilidade.',
    volume: '60M AOA',
    high: 420.00,
    low: 405.00
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE/AOA',
    name: 'Dogecoin',
    category: 'others',
    price: 110.40, // $0.12 * 920 AOA
    previousPrice: 105.00,
    changePercent: 5.14,
    history: [],
    description: 'A moeda meme pioneira que gerou um movimento cultural massivo e utilidade digital.',
    volume: '150M AOA',
    high: 112.50,
    low: 102.00
  },
  {
    id: 'shiba-inu',
    symbol: 'SHIB/AOA',
    name: 'Shiba Inu',
    category: 'others',
    price: 0.0184, // $0.000020 * 920 AOA
    previousPrice: 0.0175,
    changePercent: 5.14,
    history: [],
    description: 'Token descentralizado do ecossistema ShibaSwap com governança comunitária.',
    volume: '85M AOA',
    high: 0.0195,
    low: 0.0170
  }
].map(asset => ({
  ...asset,
  category: asset.category as any,
  history: generateHistory(asset.price, 30)
})) as Asset[];
