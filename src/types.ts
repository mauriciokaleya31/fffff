export type AssetCategory = 'shares' | 'currencies' | 'oil' | 'food' | 'others';

export interface PricePoint {
  time: string;
  price: number;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  previousPrice: number;
  changePercent: number;
  history: PricePoint[];
  description: string;
  volume: string;
  high: number;
  low: number;
  updatedAt?: number;
}

export type TradeType = 'BUY' | 'SELL';
export type TradeMode = 'SPOT' | 'BINARY'; // SPOT is classic buy/sell; BINARY is timed predictions

export interface Trade {
  id: string;
  userId: string;
  assetId: string;
  assetSymbol: string;
  assetName: string;
  type: TradeType;
  mode: TradeMode;
  quantity: number; // For SPOT, amount of asset units. For BINARY, investment amount in AOA
  openPrice: number;
  closePrice?: number;
  status: 'OPEN' | 'CLOSED';
  openTime: number;
  closeTime?: number;
  profit: number; // Current unresolved/resolved profit in AOA
  prediction?: 'UP' | 'DOWN'; // For BINARY
  duration?: number; // BINARY duration in seconds (e.g., 30, 60, 120)
  timeLeft?: number; // BINARY timer countdown
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAW';
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: TransactionType;
  amount: number;
  currency: 'AOA';
  status: TransactionStatus;
  date: string;
  paymentMethod: string;
  ibanOrPhone: string;
  proofNumber?: string;
}

export interface VerificationData {
  firstName: string;
  lastName: string;
  birthDate: string;
  location: string;
  contactNumber: string;
  biFrontUrl: string; // Base64 dataURL
  biBackUrl: string;  // Base64 dataURL
  selfieWithBiUrl: string; // Base64 dataURL
  signatureDataUrl: string; // Base64 drawn signature
  submittedAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  balance: number;
  demoBalance: number;
  currency: 'AOA';
  role: 'admin' | 'user';
  isDemo: boolean;
  winProbability: 10 | 40 | 60 | 100; // Admin configured probability of winning trades
  isBlocked: boolean;
  createdAt: string;
  lossMultiplier: number; // e.g. 1.0, allows fine-tuning return multipliers from admin panel
  winMultiplier: number; // e.g. 1.85 (85% return on binary trades)
  isVerified: boolean;
  verificationStatus: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  verificationData?: VerificationData;
}

export interface PlatformConfig {
  marketStatus: 'OPEN' | 'CLOSED';
  marketVolatilityMultiplier: number; // 0.5 (low), 1.0 (normal), 2.0 (high)
  allowsDemo: boolean;
  minimumDeposit: number;
  minimumWithdrawal: number;
  logoUrl?: string;
  logoText?: string;
  minTradeAmount: number;
  maxTradeAmount: number;
  winPayoutPercentage: number;
  onlineUsersTarget?: number;
  brokerSpreadPercentage?: number;
  globalWinProbability?: number; // Global overrides for all users if set
  apiKey?: string;
  webhookUrl?: string;
}
