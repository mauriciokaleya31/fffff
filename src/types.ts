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
  isDemo?: boolean; // If it was a demo trade
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
  winProbabilityDemo?: 10 | 40 | 60 | 100; // Admin configured probability of winning trades for DEMO account
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
  maintenanceMode?: boolean;
  communityLink?: string;
  
  // CMS Dynamic landing page fields
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCta1?: string;
  heroCta2?: string;
  stat1Title?: string;
  stat1Value?: string;
  stat2Title?: string;
  stat2Value?: string;
  stat3Title?: string;
  stat3Value?: string;
  stat4Title?: string;
  stat4Value?: string;
  simBadge?: string;
  simTitle?: string;
  simSubtitle?: string;
  benefitsBadge?: string;
  benefitsTitle?: string;
  benefitsSubtitle?: string;
  benefit1Title?: string;
  benefit1Desc?: string;
  benefit2Title?: string;
  benefit2Desc?: string;
  benefit3Title?: string;
  benefit3Desc?: string;
  banksSubtitle?: string;
  faqTitle?: string;
  faqSubtitle?: string;
  faq1Question?: string;
  faq1Answer?: string;
  faq2Question?: string;
  faq2Answer?: string;
  faq3Question?: string;
  faq3Answer?: string;
  footerRiskWarning?: string;

  // API Config parameters for Binance and Currency settings
  apiUsdToAoa?: number; // e.g. 920
  apiPriceDataSource?: 'BINANCE' | 'SIMULATOR'; // Data source mode
  apiBinanceIntervalMs?: number; // Update interval in ms
  apiLastUpdateStatus?: 'ONLINE' | 'OFFLINE' | 'SIMULATED';
  apiLastUpdateMessage?: string; // Descriptive connection logs/proofs
  apiLastFetchTime?: string; // Date/Time of last fetch
  apiCustomJustification?: string; // Custom excuse/justification for outages or system audit logs

  // Support schedule settings
  supportOpenHour?: string; // e.g. "08:00"
  supportCloseHour?: string; // e.g. "18:00"
  supportStatusForce?: 'AUTO' | 'OPEN' | 'CLOSED'; // AUTO follows hours, OPEN is always open, CLOSED is always closed
  supportAgentName?: string; // Custom support agent/bot display name
  supportAgentAvatar?: string; // Custom support avatar image URL
}

export interface SupportMessage {
  id: string;
  userId: string;
  userName: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface UserLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: string;
  action: string;
  details: string;
  timestamp: number;
}
