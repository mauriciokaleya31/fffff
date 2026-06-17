import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Asset, Trade, Transaction, UserAccount, PlatformConfig, VerificationData } from '../types';
import { INITIAL_ASSETS } from '../data/initialAssets';
import { 
  db, 
  auth,
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';

interface TradingContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  assets: Asset[];
  trades: Trade[];
  transactions: Transaction[];
  platformConfig: PlatformConfig;
  activeAsset: Asset | null;
  roleMode: 'admin' | 'user';
  activeView: 'trade' | 'wallet' | 'profile';
  setActiveView: (view: 'trade' | 'wallet' | 'profile') => void;
  walletTab: 'deposit' | 'withdraw' | 'history';
  setWalletTab: (tab: 'deposit' | 'withdraw' | 'history') => void;
  
  // Navigation & UI state
  setActiveAssetId: (id: string) => void;
  setRoleMode: (role: 'admin' | 'user') => void;
  
  // Auth operations
  signUp: (name: string, email: string, password?: string, initialRole?: 'admin' | 'user', skipSetUser?: boolean) => Promise<any>;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  setSessionUser: (user: UserAccount) => void;
  switchDemoMode: (isDemo: boolean) => void;
  
  // User activities
  requestDeposit: (amount: number, ibanOrPhone: string, method: string) => void;
  requestWithdrawal: (amount: number, ibanOrPhone: string, method: string) => boolean;
  openSpotTrade: (assetId: string, type: 'BUY' | 'SELL', quantity: number) => boolean;
  closeSpotTrade: (tradeId: string) => void;
  placeBinaryTrade: (assetId: string, prediction: 'UP' | 'DOWN', investment: number, durationSeconds: number) => boolean;
  
  // Admin Operations
  adminAdjustUserWinProbability: (userId: string, prob: 10 | 40 | 60 | 100) => void;
  adminAdjustUserBalance: (userId: string, newBalance: number, isDemo: boolean) => void;
  adminToggleUserBlock: (userId: string) => void;
  adminApproveTransaction: (txId: string) => void;
  adminRejectTransaction: (txId: string) => void;
  adminCreateAsset: (asset: Omit<Asset, 'id' | 'history' | 'changePercent' | 'previousPrice'>) => void;
  adminUpdateAssetPrice: (assetId: string, price: number) => void;
  adminDeleteAsset: (assetId: string) => void;
  adminConfigurePlatformSetting: (config: Partial<PlatformConfig>) => void;
  adminTriggerVolatility: (multiplier: number) => void;
  
  // User Verification & Profile
  submitVerification: (data: Omit<VerificationData, 'submittedAt'>) => void;
  updateProfileBasicData: (data: { firstName: string; lastName: string; birthDate: string; location: string; contactNumber: string }) => void;
  adminApproveVerification: (userId: string) => void;
  adminRejectVerification: (userId: string) => void;
  onlineUsersCount: number;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

const SEED_USERS: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Manuel Chitombe',
    email: 'manuel@kwanza.ao',
    balance: 150000.00,
    demoBalance: 1000000.00,
    currency: 'AOA',
    role: 'user',
    isDemo: false,
    winProbability: 60,
    isBlocked: false,
    createdAt: '2026-01-15T10:00:00Z',
    lossMultiplier: 1.0,
    winMultiplier: 1.80,
    isVerified: false,
    verificationStatus: 'NOT_SUBMITTED',
  },
  {
    id: 'user-2',
    name: 'Sandra Agostinho',
    email: 'sandra@bancocomerciando.ao',
    balance: 2450000.00,
    demoBalance: 1000000.00,
    currency: 'AOA',
    role: 'user',
    isDemo: false,
    winProbability: 40,
    isBlocked: false,
    createdAt: '2026-02-19T14:30:00Z',
    lossMultiplier: 1.0,
    winMultiplier: 1.80,
    isVerified: false,
    verificationStatus: 'NOT_SUBMITTED',
  },
  {
    id: 'user-3',
    name: 'Hélder Neto',
    email: 'helder.neto@petrojobs.ao',
    balance: 85000.00,
    demoBalance: 1000000.00,
    currency: 'AOA',
    role: 'user',
    isDemo: false,
    winProbability: 10,
    isBlocked: false,
    createdAt: '2026-03-05T08:12:00Z',
    lossMultiplier: 1.0,
    winMultiplier: 1.80,
    isVerified: false,
    verificationStatus: 'NOT_SUBMITTED',
  },
  {
    id: 'user-admin',
    name: 'Administrador Geral',
    email: 'kaleyapt@gmail.com',
    balance: 10000000.00,
    demoBalance: 1000000.00,
    currency: 'AOA',
    role: 'admin',
    isDemo: false,
    winProbability: 100,
    isBlocked: false,
    createdAt: '2026-01-01T00:00:00Z',
    lossMultiplier: 1.0,
    winMultiplier: 1.80,
    isVerified: true,
    verificationStatus: 'APPROVED',
  }
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    userId: 'user-1',
    userName: 'Manuel Chitombe',
    userEmail: 'manuel@kwanza.ao',
    type: 'DEPOSIT',
    amount: 150000.00,
    currency: 'AOA',
    status: 'APPROVED',
    date: '2026-05-24T11:20:00Z',
    paymentMethod: 'Transferência Multicaixa',
    ibanOrPhone: 'AO06.0040.0000.7812.3456.1018.9',
    proofNumber: 'MCX-89123041'
  },
  {
    id: 'tx-102',
    userId: 'user-2',
    userName: 'Sandra Agostinho',
    userEmail: 'sandra@bancocomerciando.ao',
    type: 'DEPOSIT',
    amount: 2450000.00,
    currency: 'AOA',
    status: 'APPROVED',
    date: '2026-05-25T09:12:00Z',
    paymentMethod: 'Depósito Direto BAI',
    ibanOrPhone: 'AO06.0008.0000.1245.9812.3012.3',
    proofNumber: 'BAI-562910'
  },
  {
    id: 'tx-103',
    userId: 'user-3',
    userName: 'Hélder Neto',
    userEmail: 'helder.neto@petrojobs.ao',
    type: 'DEPOSIT',
    amount: 85000.00,
    currency: 'AOA',
    status: 'PENDING',
    date: '2026-05-26T01:15:00Z',
    paymentMethod: 'Transferência Multicaixa Express',
    ibanOrPhone: '924151617',
    proofNumber: 'MCE-772912'
  },
  {
    id: 'tx-104',
    userId: 'user-1',
    userName: 'Manuel Chitombe',
    userEmail: 'manuel@kwanza.ao',
    type: 'WITHDRAW',
    amount: 25000.00,
    currency: 'AOA',
    status: 'PENDING',
    date: '2026-05-26T02:00:00Z',
    paymentMethod: 'IBAN de Destino',
    ibanOrPhone: 'AO06.0040.0000.7812.3456.1018.9'
  }
];

const DEFAULT_CONFIG: PlatformConfig = {
  marketStatus: 'OPEN',
  marketVolatilityMultiplier: 1.0,
  allowsDemo: true,
  minimumDeposit: 1000,
  minimumWithdrawal: 1000,
  logoUrl: '',
  logoText: 'KzOption',
  minTradeAmount: 1000,
  maxTradeAmount: 10000,
  winPayoutPercentage: 80,
  onlineUsersTarget: 50,
  brokerSpreadPercentage: 5,
  globalWinProbability: 0,
  apiUsdToAoa: 920,
  apiPriceDataSource: 'BINANCE',
  apiBinanceIntervalMs: 8500,
  apiLastUpdateStatus: 'ONLINE',
  apiLastUpdateMessage: 'Inicializado com sucesso',
  apiLastFetchTime: '',
  apiCustomJustification: 'Sistema operando normalmente. Conexão direta com a rede Binance e cotação em tempo real.'
};

export function TradingProvider({ children }: { children: React.ReactNode }) {
  // Sync states with empty defaults, which will automatically fill from Firestore listeners
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('kwanza_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(DEFAULT_CONFIG);

  const [activeAssetId, setActiveAssetIdState] = useState<string>(() => {
    return INITIAL_ASSETS[0]?.id || '';
  });

  const [roleMode, setRoleModeState] = useState<'admin' | 'user'>(() => {
    return currentUser?.role || 'user';
  });

  const [activeView, setActiveView] = useState<'trade' | 'wallet' | 'profile'>('trade');
  const [walletTab, setWalletTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');

  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(() => {
    const target = platformConfig.onlineUsersTarget ?? 50;
    return Math.max(3, Math.round(target * 0.9));
  });

  const [authReady, setAuthReady] = useState(false);

  // Authenticate client anonymously on mount to establish a secure session
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn("Anonymous authentication is not active in this Firebase project:", err);
          // Fallback to true since rules are open for public access
          setAuthReady(true);
        }
      } else {
        setAuthReady(true);
      }
    });
    return () => unsubAuth();
  }, []);

  // Keep references to access inside fast-running intervals safely
  const usersRef = useRef(users);
  usersRef.current = users;
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;
  const platformConfigRef = useRef(platformConfig);
  platformConfigRef.current = platformConfig;
  const transactionsRef = useRef(transactions);
  transactionsRef.current = transactions;

  // Real-time Firestore Listeners Setup
  useEffect(() => {
    if (!authReady) return;

    // 1. Sync config
    const configDocRef = doc(db, 'config', 'platform');
    const unsubConfig = onSnapshot(configDocRef, (snap) => {
      if (snap.exists()) {
        setPlatformConfig(snap.data() as PlatformConfig);
      } else {
        setDoc(configDocRef, DEFAULT_CONFIG).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, 'config/platform');
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/platform');
    });

    // 2. Sync assets
    const assetsColRef = collection(db, 'assets');
    const unsubAssets = onSnapshot(assetsColRef, (snap) => {
      if (snap.empty) {
        INITIAL_ASSETS.forEach(asset => {
          setDoc(doc(db, 'assets', asset.id), asset).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `assets/${asset.id}`);
          });
        });
      } else {
        const list: Asset[] = [];
        snap.forEach(doc => {
          list.push(doc.data() as Asset);
        });
        setAssets(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'assets');
    });

    // 3. Sync users
    const usersColRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersColRef, (snap) => {
      if (snap.empty) {
        SEED_USERS.forEach(user => {
          setDoc(doc(db, 'users', user.id), user).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `users/${user.id}`);
          });
        });
      } else {
        const list: UserAccount[] = [];
        snap.forEach(doc => {
          list.push(doc.data() as UserAccount);
        });
        setUsers(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    // 4. Sync trades
    const tradesColRef = collection(db, 'trades');
    const unsubTrades = onSnapshot(tradesColRef, (snap) => {
      const list: Trade[] = [];
      snap.forEach(doc => {
        list.push(doc.data() as Trade);
      });
      list.sort((a, b) => b.openTime - a.openTime);
      setTrades(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'trades');
    });

    // 5. Sync transactions
    const txColRef = collection(db, 'transactions');
    const unsubTx = onSnapshot(txColRef, (snap) => {
      if (snap.empty) {
        SEED_TRANSACTIONS.forEach(tx => {
          setDoc(doc(db, 'transactions', tx.id), tx).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `transactions/${tx.id}`);
          });
        });
      } else {
        const list: Transaction[] = [];
        snap.forEach(doc => {
          list.push(doc.data() as Transaction);
        });
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'transactions');
    });

    return () => {
      unsubConfig();
      unsubAssets();
      unsubUsers();
      unsubTrades();
      unsubTx();
    };
  }, [authReady]);

  // Sync Logged-In user across triggers & write back to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kwanza_current_user', JSON.stringify(currentUser));
      const freshUser = users.find(u => u.id === currentUser.id);
      if (freshUser) {
        if (JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
          setCurrentUser(freshUser);
          if (freshUser.isBlocked) {
            setCurrentUser(null);
            setRoleModeState('user');
            localStorage.removeItem('kwanza_current_user');
          }
        }
      }
    } else {
      localStorage.removeItem('kwanza_current_user');
    }
  }, [users, currentUser]);

  // Dynamically ensure kaleyapt@gmail.com exists as admin in Firestore once users are fetched
  useEffect(() => {
    if (authReady && users.length > 0) {
      const hasAdmin = users.some(u => u.email.toLowerCase() === 'kaleyapt@gmail.com');
      if (!hasAdmin) {
        const adminUser: UserAccount = {
          id: 'user-admin',
          name: 'Administrador Geral',
          email: 'kaleyapt@gmail.com',
          balance: 10000000.00,
          demoBalance: 1000000.00,
          currency: 'AOA',
          role: 'admin',
          isDemo: false,
          winProbability: 100,
          isBlocked: false,
          createdAt: new Date().toISOString(),
          lossMultiplier: 1.0,
          winMultiplier: 1.80,
          isVerified: true,
          verificationStatus: 'APPROVED',
        };
        setDoc(doc(db, 'users', 'user-admin'), adminUser).catch(err => {
          console.warn("Could not dynamically seed kaleyapt@gmail.com:", err);
        });
      }
    }
  }, [authReady, users]);

  // Online clients simulator counter ticks
  useEffect(() => {
    const interval = setInterval(() => {
      const target = platformConfigRef.current.onlineUsersTarget ?? 50;
      const minVal = Math.max(3, Math.round(target * 0.78));
      const maxVal = Math.round(target * 1.12);
      const randomFluctuation = minVal + Math.floor(Math.random() * (maxVal - minVal + 1));
      setOnlineUsersCount(randomFluctuation);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize assets periodically with genuine Binance API prices
  useEffect(() => {
    const fetchApiPrices = async () => {
      if (platformConfigRef.current.marketStatus !== 'OPEN') return;

      const config = platformConfigRef.current;
      const source = config.apiPriceDataSource ?? 'BINANCE';
      const USD_TO_AOA = config.apiUsdToAoa ?? 920;

      if (source === 'SIMULATOR') {
        const nowStr = new Date().toLocaleString('pt-AO');
        const lastFetchMs = config.apiLastFetchTime ? new Date(config.apiLastFetchTime).getTime() : 0;
        if (config.apiLastUpdateStatus !== 'SIMULATED' || isNaN(lastFetchMs) || (Date.now() - lastFetchMs > 60000)) {
          updateDoc(doc(db, 'config', 'platform'), {
            apiLastUpdateStatus: 'SIMULATED',
            apiLastUpdateMessage: 'O simulador orgânico está ativo por decisão administrativa (Cotações locais).',
            apiLastFetchTime: nowStr
          }).catch(e => console.warn("Could not save status to Firestore:", e));
        }
        return;
      }

      try {
        const res = await fetch('https://api.binance.com/api/v3/ticker/price');
        if (!res.ok) throw new Error(`Binance HTTP Error: ${res.status} ${res.statusText}`);
        const data = await res.json() as { symbol: string; price: string }[];
        
        const tickerMap: { [key: string]: string } = {
          'bitcoin': 'BTCUSDT',
          'ethereum': 'ETHUSDT',
          'solana': 'SOLUSDT',
          'binance-coin': 'BNBUSDT',
          'ripple': 'XRPUSDT',
          'cardano': 'ADAUSDT',
          'dogecoin': 'DOGEUSDT',
          'shiba-inu': 'SHIBUSDT'
        };

        // Perform local and firestore updating safely
        setAssets(prevAssets => {
          return prevAssets.map(asset => {
            const sym = tickerMap[asset.id];
            if (!sym) return asset;

            const tickerObj = data.find(t => t.symbol === sym);
            if (!tickerObj) return asset;

            const newUsdPrice = parseFloat(tickerObj.price);
            if (isNaN(newUsdPrice)) return asset;

            const newPrice = parseFloat((newUsdPrice * USD_TO_AOA).toFixed(asset.id === 'shiba-inu' ? 4 : 2));
            const oldPrice = asset.price;

            // If another client updated this asset within the last 8 seconds, skip fetching and writing
            if (asset.updatedAt && (Date.now() - asset.updatedAt < 8000)) {
              return asset;
            }

            if (newPrice === oldPrice) return asset;

            const diff = newPrice - oldPrice;
            const pct = parseFloat(((newPrice - asset.previousPrice) / asset.previousPrice * 100).toFixed(2));
            const high = Math.max(asset.high, newPrice);
            const low = Math.min(asset.low, newPrice);

            const nextHistory = [...asset.history];
            const now = new Date();
            const timeStr = now.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            nextHistory.push({ time: timeStr, price: newPrice });
            if (nextHistory.length > 50) nextHistory.shift();

            const updatedAsset = {
              ...asset,
              price: newPrice,
              changePercent: pct,
              high,
              low,
              history: nextHistory,
              updatedAt: Date.now()
            };

            // Write asset price back to Firestore
            setDoc(doc(db, 'assets', asset.id), updatedAsset).catch(err => {
              console.warn("Could not save asset to Firestore:", err);
            });

            return updatedAsset;
          });
        });

        // Throttle updates to database config to minimize read/write bandwidth
        const nowStr = new Date().toLocaleString('pt-AO');
        const lastFetchMs = config.apiLastFetchTime ? new Date(config.apiLastFetchTime).getTime() : 0;
        if (config.apiLastUpdateStatus !== 'ONLINE' || isNaN(lastFetchMs) || (Date.now() - lastFetchMs > 60000)) {
          updateDoc(doc(db, 'config', 'platform'), {
            apiLastUpdateStatus: 'ONLINE',
            apiLastUpdateMessage: 'API Binance conectada e respondendo em tempo real.',
            apiLastFetchTime: nowStr
          }).catch(e => console.warn("Could not save status to Firestore:", e));
        }

      } catch (err) {
        console.warn("Binance API fetch bypassed/blocked. Using simulated organic movements.", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        const nowStr = new Date().toLocaleString('pt-AO');
        const lastFetchMs = config.apiLastFetchTime ? new Date(config.apiLastFetchTime).getTime() : 0;
        if (config.apiLastUpdateStatus !== 'OFFLINE' || isNaN(lastFetchMs) || (Date.now() - lastFetchMs > 40000)) {
          updateDoc(doc(db, 'config', 'platform'), {
            apiLastUpdateStatus: 'OFFLINE',
            apiLastUpdateMessage: `Erro de conexão / Limite excedido: ${errMsg}`,
            apiLastFetchTime: nowStr
          }).catch(e => console.warn("Could not save error status to Firestore:", e));
        }
      }
    };

    fetchApiPrices();
    const currentIntervalMs = platformConfig.apiBinanceIntervalMs ?? 8500;
    const apiInterval = setInterval(fetchApiPrices, currentIntervalMs);
    return () => clearInterval(apiInterval);
  }, [platformConfig.apiBinanceIntervalMs, platformConfig.apiPriceDataSource]);

  const activeAsset = assets.find(a => a.id === activeAssetId) || assets[0] || null;

  const setActiveAssetId = (id: string) => {
    setActiveAssetIdState(id);
  };

  const setRoleMode = (role: 'admin' | 'user') => {
    setRoleModeState(role);
  };

  // Auth logins
  const login = useCallback(async (emailOrUsername: string, password?: string) => {
    const credential = emailOrUsername.toLowerCase().trim();
    const isSpecialAdmin = credential === 'adm' && password === '1234';
    const isSpecialUser = credential === 'user' && password === '1234';

    // 1. Check for pre-seeded quick login shortcuts
    if (isSpecialAdmin) {
      let adminUser = users.find(u => u.role === 'admin' && u.email === 'kaleyapt@gmail.com');
      if (!adminUser) {
        adminUser = {
          id: 'user-admin',
          name: 'Administrador Geral',
          email: 'kaleyapt@gmail.com',
          balance: 10000000.00,
          demoBalance: 1000000.00,
          currency: 'AOA',
          role: 'admin',
          isDemo: false,
          winProbability: 100,
          isBlocked: false,
          createdAt: new Date().toISOString(),
          lossMultiplier: 1.0,
          winMultiplier: 1.80,
          isVerified: true,
          verificationStatus: 'APPROVED',
        };
        await setDoc(doc(db, 'users', 'user-admin'), adminUser).catch(err => handleFirestoreError(err, OperationType.WRITE, 'users/user-admin'));
      }
      setCurrentUser(adminUser);
      setRoleModeState('admin');
      return true;
    }

    if (isSpecialUser) {
      let normalUser = users.find(u => u.id === 'user-1' || u.email === 'manuel@kwanza.ao');
      if (!normalUser) {
        normalUser = {
          id: 'user-1',
          name: 'Manuel Chitombe',
          email: 'manuel@kwanza.ao',
          balance: 150000.00,
          demoBalance: 1000000.00,
          currency: 'AOA',
          role: 'user',
          isDemo: false,
          winProbability: 60,
          isBlocked: false,
          createdAt: new Date().toISOString(),
          lossMultiplier: 1.0,
          winMultiplier: 1.80,
          isVerified: false,
          verificationStatus: 'NOT_SUBMITTED',
        };
        await setDoc(doc(db, 'users', 'user-1'), normalUser).catch(err => handleFirestoreError(err, OperationType.WRITE, 'users/user-1'));
      }
      setCurrentUser(normalUser);
      setRoleModeState('user');
      return true;
    }

    // 2. Real Firebase Auth Login (if a password is provided)
    if (password) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, credential, password);
        const firebaseUser = userCred.user;
        const freshUser = users.find(u => u.email.toLowerCase() === credential || u.id === firebaseUser.uid);
        if (freshUser) {
          if (freshUser.isBlocked) {
            throw new Error("Esta conta está bloqueada pelo administrador.");
          }
          setCurrentUser(freshUser);
          setRoleModeState(freshUser.role);
          return true;
        } else {
          // Firebase authenticated but no FireStore document yet - create it!
          const isRootAdmin = credential === 'kaleyapt@gmail.com';
          const newUser: UserAccount = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || (isRootAdmin ? 'Administrador Geral' : 'Novo Utilizador'),
            email: credential,
            balance: isRootAdmin ? 10000000.00 : 10000.00,
            demoBalance: 1000000.00,
            currency: 'AOA',
            role: isRootAdmin ? 'admin' : 'user',
            isDemo: false,
            winProbability: isRootAdmin ? 100 : 60,
            isBlocked: false,
            createdAt: new Date().toISOString(),
            lossMultiplier: 1.0,
            winMultiplier: 1.80,
            isVerified: isRootAdmin,
            verificationStatus: isRootAdmin ? 'APPROVED' : 'NOT_SUBMITTED',
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`));
          setCurrentUser(newUser);
          setRoleModeState(newUser.role);
          return true;
        }
      } catch (err: any) {
        // If Auth provider is disabled or missing details, fall back to local Firestore checking
        if (err.code === 'auth/configuration-not-found' || err.message?.includes('configuration-not-found') || err.message?.includes('auth/operation-not-allowed')) {
          console.warn("Using fallback local authentication. Go to Firebase Console on Auth tab to activate the Email / Password provider.");
          // Fallback matching
          const found = users.find(u => u.email.toLowerCase() === credential);
          if (found) {
            if (found.isBlocked) {
              throw new Error("Esta conta foi bloqueada.");
            }
            // Require 1234 or Luanda.9090 as bypass
            const expectedPass = (credential === 'kaleyapt@gmail.com') ? 'Luanda.9090' : '1234';
            if (password !== expectedPass) {
              throw new Error("Senha incorreta");
            }
            setCurrentUser(found);
            setRoleModeState(found.role);
            return true;
          }
          throw new Error("Utilizador não encontrado no sistema local.");
        } else {
          throw err;
        }
      }
    }

    // 3. Simple fallback (no password matches via local matching)
    const found = users.find(u => u.email.toLowerCase() === credential || u.name.toLowerCase() === credential);
    if (found) {
      if (found.isBlocked) {
        return false;
      }
      setCurrentUser(found);
      setRoleModeState(found.role);
      return true;
    }

    return false;
  }, [users]);

  // Sign up - writes to Firebase Auth and Firestore
  const signUp = useCallback(async (name: string, email: string, password?: string, initialRole: 'admin' | 'user' = 'user', skipSetUser: boolean = false) => {
    const emailLower = email.toLowerCase().trim();
    if (users.some(u => u.email.toLowerCase() === emailLower)) {
      throw new Error("Este endereço de email já está registado.");
    }

    let uid = `user-${Date.now()}`;

    if (password) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, emailLower, password);
        uid = userCred.user.uid;
        
        // Trigger actual email verification from the Firebase Auth client
        try {
          await sendEmailVerification(userCred.user);
          console.log("Real email verification triggered via Firebase!");
        } catch (verifErr) {
          console.warn("Could not trigger native email verification automatically:", verifErr);
        }
      } catch (err: any) {
        console.warn("Firebase Auth Register status:", err);
        const isProviderNotEnabled = 
          err.code === 'auth/operation-not-allowed' || 
          err.code === 'auth/configuration-not-found' ||
          err.message?.includes('operation-not-allowed') || 
          err.message?.includes('configuration-not-found');
          
        if (isProviderNotEnabled) {
          console.warn("Firebase email auth provider not active. Creating account locally.");
        } else {
          throw err;
        }
      }
    }

    const newUser: UserAccount = {
      id: uid,
      name: name.trim(),
      email: emailLower,
      balance: initialRole === 'admin' ? 5000000.00 : 10000.00,
      demoBalance: 1000000.00,
      currency: 'AOA',
      role: initialRole,
      isDemo: false,
      winProbability: 60,
      isBlocked: false,
      createdAt: new Date().toISOString(),
      lossMultiplier: 1.0,
      winMultiplier: 1.80,
      isVerified: initialRole === 'admin',
      verificationStatus: initialRole === 'admin' ? 'APPROVED' : 'NOT_SUBMITTED',
    };
    
    await setDoc(doc(db, 'users', uid), newUser)
      .then(() => {
        if (!skipSetUser) {
          setCurrentUser(newUser);
          setRoleModeState(initialRole);
        }
      })
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${uid}`));

    return newUser;
  }, [users]);

  const setSessionUser = useCallback((user: UserAccount) => {
    setCurrentUser(user);
    setRoleModeState(user.role);
  }, []);

  const logout = useCallback(() => {
    signOut(auth).catch(err => console.warn("Sign out failure:", err));
    setCurrentUser(null);
    setRoleModeState('user');
    localStorage.removeItem('kwanza_current_user');
  }, []);

  const switchDemoMode = useCallback((isDemo: boolean) => {
    if (!currentUser) return;
    updateDoc(doc(db, 'users', currentUser.id), { isDemo })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`));
  }, [currentUser]);

  // Deposits & Withdrawals - writes to Firestore
  const requestDeposit = useCallback((amount: number, ibanOrPhone: string, method: string) => {
    if (!currentUser) return;
    if (amount < 1000 || amount > 5000000) return; // limits
    
    const txId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      id: txId,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      type: 'DEPOSIT',
      amount,
      currency: 'AOA',
      status: 'PENDING',
      date: new Date().toISOString(),
      paymentMethod: method,
      ibanOrPhone,
      proofNumber: `REF-${Math.floor(10000000 + Math.random() * 90000000)}`
    };

    setDoc(doc(db, 'transactions', txId), newTx)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `transactions/${txId}`));
  }, [currentUser]);

  const requestWithdrawal = useCallback((amount: number, ibanOrPhone: string, method: string) => {
    if (!currentUser) return false;
    if (amount < 1000) return false;

    // Daily limit
    const today = new Date().toISOString().substring(0, 10);
    const userWithdrawalSum = transactionsRef.current
      .filter(tx => tx.userId === currentUser.id && tx.type === 'WITHDRAW' && tx.date.startsWith(today) && tx.status !== 'REJECTED')
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (userWithdrawalSum + amount > 250000) { // Limit adjusted for multi test
      return false;
    }

    const available = currentUser.isDemo ? currentUser.demoBalance : currentUser.balance;
    if (available < amount) return false;

    const fieldToUpdate = currentUser.isDemo ? 'demoBalance' : 'balance';
    
    updateDoc(doc(db, 'users', currentUser.id), {
      [fieldToUpdate]: available - amount
    }).then(() => {
      const txId = `tx-${Date.now()}`;
      const newTx: Transaction = {
        id: txId,
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        type: 'WITHDRAW',
        amount,
        currency: 'AOA',
        status: 'PENDING',
        date: new Date().toISOString(),
        paymentMethod: method,
        ibanOrPhone
      };
      setDoc(doc(db, 'transactions', txId), newTx)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `transactions/${txId}`));
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`));

    return true;
  }, [currentUser]);

  // Spot trading buy/sell
  const openSpotTrade = useCallback((assetId: string, type: 'BUY' | 'SELL', quantity: number) => {
    if (!currentUser) return false;
    if (platformConfig.marketStatus === 'CLOSED') return false;
    
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return false;

    const currentCost = asset.price * quantity;
    if (currentCost < 1000) return false;

    const userBalance = currentUser.isDemo ? currentUser.demoBalance : currentUser.balance;
    if (userBalance < currentCost) return false;

    const fieldToUpdate = currentUser.isDemo ? 'demoBalance' : 'balance';

    updateDoc(doc(db, 'users', currentUser.id), {
      [fieldToUpdate]: userBalance - currentCost
    }).then(() => {
      const tradeId = `trade-${Date.now()}`;
      const newTrade: Trade = {
        id: tradeId,
        userId: currentUser.id,
        assetId,
        assetSymbol: asset.symbol,
        assetName: asset.name,
        type,
        mode: 'SPOT',
        quantity,
        openPrice: asset.price,
        status: 'OPEN',
        openTime: Date.now(),
        profit: 0
      };
      setDoc(doc(db, 'trades', tradeId), newTrade)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `trades/${tradeId}`));
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`));

    return true;
  }, [currentUser, assets, platformConfig]);

  // Closing Spot trades
  const closeSpotTrade = useCallback((tradeId: string) => {
    const trade = trades.find(t => t.id === tradeId && t.status === 'OPEN');
    if (!trade) return;
    const asset = assets.find(a => a.id === trade.assetId);
    if (!asset) return;

    let currentProfit = 0;
    if (trade.type === 'BUY') {
      currentProfit = (asset.price - trade.openPrice) * trade.quantity;
    } else {
      currentProfit = (trade.openPrice - asset.price) * trade.quantity;
    }

    const cost = trade.openPrice * trade.quantity;
    const payoutAmount = Math.max(0, cost + currentProfit);

    const userToUpdate = usersRef.current.find(u => u.id === trade.userId);
    if (userToUpdate) {
      const isTradeDemo = currentUserRef.current?.id === userToUpdate.id ? currentUserRef.current.isDemo : userToUpdate.isDemo;
      const field = isTradeDemo ? 'demoBalance' : 'balance';
      
      updateDoc(doc(db, 'users', userToUpdate.id), {
        [field]: userToUpdate[field] + payoutAmount
      }).then(() => {
        updateDoc(doc(db, 'trades', tradeId), {
          closePrice: asset.price,
          closeTime: Date.now(),
          status: 'CLOSED',
          profit: currentProfit
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `trades/${tradeId}`));
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userToUpdate.id}`));
    }
  }, [assets, trades]);

  // Binary Contracts (Timed options)
  const placeBinaryTrade = useCallback((assetId: string, prediction: 'UP' | 'DOWN', investment: number, durationSeconds: number) => {
    if (!currentUser) return false;
    if (platformConfig.marketStatus === 'CLOSED') return false;
    
    const minAmount = platformConfig.minTradeAmount ?? 1000;
    const maxAmount = platformConfig.maxTradeAmount ?? 100000;
    if (investment < minAmount || investment > maxAmount) return false;

    const asset = assets.find(a => a.id === assetId);
    if (!asset) return false;

    const userBalance = currentUser.isDemo ? currentUser.demoBalance : currentUser.balance;
    if (userBalance < investment) return false;

    const fieldToUpdate = currentUser.isDemo ? 'demoBalance' : 'balance';

    updateDoc(doc(db, 'users', currentUser.id), {
      [fieldToUpdate]: userBalance - investment
    }).then(() => {
      const tradeId = `trade-${Date.now()}`;
      const newTrade: Trade = {
        id: tradeId,
        userId: currentUser.id,
        assetId,
        assetSymbol: asset.symbol,
        assetName: asset.name,
        type: 'BUY',
        mode: 'BINARY',
        quantity: investment,
        openPrice: asset.price,
        status: 'OPEN',
        openTime: Date.now(),
        prediction,
        duration: durationSeconds,
        timeLeft: durationSeconds,
        profit: -investment
      };
      setDoc(doc(db, 'trades', tradeId), newTrade)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `trades/${tradeId}`));
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.id}`));

    return true;
  }, [currentUser, assets, platformConfig]);

  // In-memory binary countdown tick loop (with Firestore persistence on settle)
  useEffect(() => {
    const mainTimer = setInterval(() => {
      // 1. Advance Timers locally for UI rendering
      setTrades(prevTrades => {
        let hasChanges = false;
        const nextTrades = prevTrades.map(t => {
          if (t.mode === 'BINARY' && t.status === 'OPEN') {
            hasChanges = true;
            const nextTimeLeft = (t.timeLeft ?? 1) - 1;
            const userTarget = usersRef.current.find(u => u.id === t.userId);
            
            if (nextTimeLeft <= 0) {
              const asset = assets.find(a => a.id === t.assetId);
              
              const globalProb = platformConfigRef.current.globalWinProbability ?? 0;
              const winProbability = globalProb > 0 ? globalProb : (userTarget?.winProbability ?? 60);
              const globalPayout = platformConfigRef.current.winPayoutPercentage ?? 80;
              const winMultiplier = 1 + globalPayout / 100;
              
              const rollDice = Math.random() * 100;
              const isOverridingWin = rollDice <= winProbability;
              
              let finalPrice = asset ? asset.price : t.openPrice;
              
              if (isOverridingWin) {
                if (t.prediction === 'UP') {
                  finalPrice = t.openPrice + (Math.random() * 0.01 + 0.001) * t.openPrice;
                } else {
                  finalPrice = t.openPrice - (Math.random() * 0.01 + 0.001) * t.openPrice;
                }
              } else {
                if (t.prediction === 'UP') {
                  finalPrice = t.openPrice - (Math.random() * 0.01 + 0.001) * t.openPrice;
                } else {
                  finalPrice = t.openPrice + (Math.random() * 0.01 + 0.001) * t.openPrice;
                }
              }

              const isActualUP = finalPrice > t.openPrice;
              const won = (t.prediction === 'UP' && isActualUP) || (t.prediction === 'DOWN' && !isActualUP);
              
              const returnCash = won ? t.quantity * winMultiplier : 0;
              const actualNetProfit = won ? returnCash - t.quantity : -t.quantity;

              if (userTarget) {
                const userDemo = currentUserRef.current?.id === userTarget.id && currentUserRef.current.isDemo;
                const field = userDemo ? 'demoBalance' : 'balance';
                
                // Write settlement back to user document in Firestore
                updateDoc(doc(db, 'users', userTarget.id), {
                  [field]: userTarget[field] + returnCash
                }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userTarget.id}`));
              }

              // Update the trade document in Firestore
              updateDoc(doc(db, 'trades', t.id), {
                timeLeft: 0,
                closePrice: parseFloat(finalPrice.toFixed(2)),
                closeTime: Date.now(),
                status: 'CLOSED',
                profit: parseFloat(actualNetProfit.toFixed(2))
              }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `trades/${t.id}`));

              return {
                ...t,
                timeLeft: 0,
                closePrice: parseFloat(finalPrice.toFixed(2)),
                closeTime: Date.now(),
                status: 'CLOSED',
                profit: parseFloat(actualNetProfit.toFixed(2))
              };
            } else {
              // Countdown ticker step
              const asset = assets.find(a => a.id === t.assetId);
              let tempProfit = -t.quantity;
              if (asset) {
                const goingUp = asset.price > t.openPrice;
                const matchesPrediction = (t.prediction === 'UP' && goingUp) || (t.prediction === 'DOWN' && !goingUp);
                if (matchesPrediction) {
                  const globalPayout = platformConfigRef.current.winPayoutPercentage ?? 80;
                  tempProfit = t.quantity * (globalPayout / 100);
                }
              }
              return {
                ...t,
                timeLeft: nextTimeLeft,
                profit: parseFloat(tempProfit.toFixed(2))
              };
            }
          }
          return t;
        });

        return hasChanges ? nextTrades : prevTrades;
      });

      // 2. Coordinated real-time organic price drift via Firestore
      if (platformConfigRef.current.marketStatus === 'OPEN') {
        assets.forEach(asset => {
          // If updated recently (within 2.8 seconds), another client is drifting it in real time
          if (asset.updatedAt && (Date.now() - asset.updatedAt < 2800)) {
            return;
          }

          const baseVol = 0.002;
          const volMultiplier = platformConfigRef.current.marketVolatilityMultiplier;
          const scale = baseVol * volMultiplier;
          const changePercent = (Math.random() - 0.49) * 2 * scale;
          
          const oldPrice = asset.price;
          const rawPrice = oldPrice * (1 + changePercent);
          const newPrice = parseFloat(Math.max(0.0001, rawPrice).toFixed(asset.id === 'shiba-inu' ? 4 : 2));
          const pct = parseFloat(((newPrice - asset.previousPrice) / asset.previousPrice * 100).toFixed(2));

          const high = Math.max(asset.high, newPrice);
          const low = Math.min(asset.low, newPrice);

          const nextHistory = [...asset.history];
          const now = new Date();
          const timeStr = now.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          nextHistory.push({ time: timeStr, price: newPrice });
          if (nextHistory.length > 50) nextHistory.shift();

          const updatedAsset = {
            ...asset,
            price: newPrice,
            changePercent: pct,
            high,
            low,
            history: nextHistory,
            updatedAt: Date.now()
          };

          // Broadcast to Firestore in true real-time so all connected clients observe identical prices
          setDoc(doc(db, 'assets', asset.id), updatedAsset).catch(err => {
            console.warn("Could not save asset organic drift to Firestore:", err);
          });
        });
      }

      // 3. For spot trades open, update current floating profit & loss
      setTrades(prevTrades => {
        let hasOpenSpot = false;
        const computed = prevTrades.map(t => {
          if (t.mode === 'SPOT' && t.status === 'OPEN') {
            hasOpenSpot = true;
            const assetInstance = assets.find(a => a.id === t.assetId);
            if (assetInstance) {
              let currentProfit = 0;
              if (t.type === 'BUY') {
                currentProfit = (assetInstance.price - t.openPrice) * t.quantity;
              } else {
                currentProfit = (t.openPrice - assetInstance.price) * t.quantity;
              }
              return {
                ...t,
                profit: parseFloat(currentProfit.toFixed(2))
              };
            }
          }
          return t;
        });
        return hasOpenSpot ? computed : prevTrades;
      });

    }, 3000);

    return () => clearInterval(mainTimer);
  }, [assets, platformConfig]);

  // ADMIN ACTIONS - Writes directly into Firestore
  const adminAdjustUserWinProbability = useCallback((userId: string, prob: 10 | 40 | 60 | 100) => {
    updateDoc(doc(db, 'users', userId), { winProbability: prob })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`));
  }, []);

  const adminAdjustUserBalance = useCallback((userId: string, newBalance: number, isDemo: boolean) => {
    const field = isDemo ? 'demoBalance' : 'balance';
    updateDoc(doc(db, 'users', userId), { [field]: newBalance })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`));
  }, []);

  const adminToggleUserBlock = useCallback((userId: string) => {
    const target = usersRef.current.find(u => u.id === userId);
    if (!target) return;
    updateDoc(doc(db, 'users', userId), { isBlocked: !target.isBlocked })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`));
  }, []);

  const adminApproveTransaction = useCallback((txId: string) => {
    const tx = transactionsRef.current.find(t => t.id === txId && t.status === 'PENDING');
    if (!tx) return;

    const targetUser = usersRef.current.find(u => u.id === tx.userId);
    if (targetUser) {
      let addition = tx.amount;
      if (tx.type === 'WITHDRAW') {
        addition = 0;
      }
      
      updateDoc(doc(db, 'users', targetUser.id), {
        balance: tx.type === 'DEPOSIT' ? targetUser.balance + addition : targetUser.balance
      }).then(() => {
        updateDoc(doc(db, 'transactions', txId), { status: 'APPROVED' })
          .catch(err => handleFirestoreError(err, OperationType.UPDATE, `transactions/${txId}`));
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${targetUser.id}`));
    }
  }, []);

  const adminRejectTransaction = useCallback((txId: string) => {
    const tx = transactionsRef.current.find(t => t.id === txId && t.status === 'PENDING');
    if (!tx) return;

    if (tx.type === 'WITHDRAW') {
      const targetUser = usersRef.current.find(u => u.id === tx.userId);
      if (targetUser) {
        updateDoc(doc(db, 'users', targetUser.id), {
          balance: targetUser.balance + tx.amount
        }).then(() => {
          updateDoc(doc(db, 'transactions', txId), { status: 'REJECTED' })
            .catch(err => handleFirestoreError(err, OperationType.UPDATE, `transactions/${txId}`));
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${targetUser.id}`));
      }
    } else {
      updateDoc(doc(db, 'transactions', txId), { status: 'REJECTED' })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `transactions/${txId}`));
    }
  }, []);

  const adminCreateAsset = useCallback((assetData: Omit<Asset, 'id' | 'history' | 'changePercent' | 'previousPrice'>) => {
    const id = assetData.symbol.toLowerCase().replace('/', '');
    const newAsset: Asset = {
      ...assetData,
      id,
      previousPrice: assetData.price,
      changePercent: 0,
      high: assetData.price,
      low: assetData.price,
      history: [
        {
          time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          price: assetData.price
        }
      ]
    };
    
    setDoc(doc(db, 'assets', id), newAsset)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `assets/${id}`));
  }, []);

  const adminUpdateAssetPrice = useCallback((assetId: string, price: number) => {
    const a = assets.find(asset => asset.id === assetId);
    if (!a) return;

    const pct = parseFloat(((price - a.previousPrice) / a.previousPrice * 100).toFixed(2));
    const high = Math.max(a.high, price);
    const low = Math.min(a.low, price);
    const nextHistory = [...a.history, {
      time: new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      price
    }];
    if (nextHistory.length > 50) nextHistory.shift();

    updateDoc(doc(db, 'assets', assetId), {
      price,
      changePercent: pct,
      high,
      low,
      history: nextHistory
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `assets/${assetId}`));
  }, [assets]);

  const adminDeleteAsset = useCallback((assetId: string) => {
    deleteDoc(doc(db, 'assets', assetId))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `assets/${assetId}`));
  }, []);

  const adminConfigurePlatformSetting = useCallback((config: Partial<PlatformConfig>) => {
    updateDoc(doc(db, 'config', 'platform'), config)
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, 'config/platform'));
  }, []);

  const adminTriggerVolatility = useCallback((multiplier: number) => {
    updateDoc(doc(db, 'config', 'platform'), { marketVolatilityMultiplier: multiplier })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, 'config/platform'));
  }, []);

  // Verification profiles
  const submitVerification = useCallback((data: Omit<VerificationData, 'submittedAt'>) => {
    if (!currentUserRef.current) return;
    const verificationData: VerificationData = {
      ...data,
      submittedAt: new Date().toISOString(),
    };
    
    updateDoc(doc(db, 'users', currentUserRef.current.id), {
      verificationStatus: 'PENDING',
      verificationData,
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUserRef.current?.id}`));
  }, []);

  const updateProfileBasicData = useCallback((data: { firstName: string; lastName: string; birthDate: string; location: string; contactNumber: string }) => {
    if (!currentUserRef.current) return;
    const currentVerificationData = currentUserRef.current.verificationData || {
      firstName: '',
      lastName: '',
      birthDate: '',
      location: '',
      contactNumber: '',
      biFrontUrl: '',
      biBackUrl: '',
      selfieWithBiUrl: '',
      signatureDataUrl: '',
      submittedAt: '',
    };
    
    updateDoc(doc(db, 'users', currentUserRef.current.id), {
      name: `${data.firstName} ${data.lastName}`.trim() || currentUserRef.current.name,
      verificationData: {
        ...currentVerificationData,
        ...data,
      }
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUserRef.current?.id}`));
  }, []);

  const adminApproveVerification = useCallback((userId: string) => {
    updateDoc(doc(db, 'users', userId), {
      isVerified: true,
      verificationStatus: 'APPROVED',
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`));
  }, []);

  const adminRejectVerification = useCallback((userId: string) => {
    updateDoc(doc(db, 'users', userId), {
      isVerified: false,
      verificationStatus: 'REJECTED',
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`));
  }, []);

  return (
    <TradingContext.Provider value={{
      currentUser,
      users,
      assets,
      trades,
      transactions,
      platformConfig,
      activeAsset,
      roleMode,
      activeView,
      setActiveView,
      walletTab,
      setWalletTab,
      setActiveAssetId,
      setRoleMode,
      signUp,
      login,
      logout,
      setSessionUser,
      switchDemoMode,
      requestDeposit,
      requestWithdrawal,
      openSpotTrade,
      closeSpotTrade,
      placeBinaryTrade,
      adminAdjustUserWinProbability,
      adminAdjustUserBalance,
      adminToggleUserBlock,
      adminApproveTransaction,
      adminRejectTransaction,
      adminCreateAsset,
      adminUpdateAssetPrice,
      adminDeleteAsset,
      adminConfigurePlatformSetting,
      adminTriggerVolatility,
      submitVerification,
      updateProfileBasicData,
      adminApproveVerification,
      adminRejectVerification,
      onlineUsersCount
    }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}
