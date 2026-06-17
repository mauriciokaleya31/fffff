import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { Asset, UserAccount, AssetCategory, PlatformConfig } from '../types';
import { 
  Users, Landmark, Settings, Sliders, Check, Ban, Coins, 
  Trash2, Plus, Volume, CheckCircle2, XCircle, AlertTriangle,
  ShieldCheck, FileText, Fingerprint, Eye, EyeOff, Search, Filter,
  ArrowUpRight, ArrowDownLeft, Clock, Percent, Activity, Sparkles,
  RefreshCw, Smartphone, MapPin, Receipt, ShieldAlert, BookOpen, BarChart3, TrendingUp,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { formatKz, formatKzNum } from '../utils';

export default function AdminPanel() {
  const {
    users,
    assets,
    trades,
    transactions,
    platformConfig,
    adminAdjustUserWinProbability,
    adminAdjustUserBalance,
    adminToggleUserBlock,
    adminApproveTransaction,
    adminRejectTransaction,
    adminCreateAsset,
    adminUpdateAssetPrice,
    adminDeleteAsset,
    adminConfigurePlatformSetting,
    adminApproveVerification,
    adminRejectVerification,
    onlineUsersCount
  } = useTrading();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'transactions' | 'market' | 'traffic' | 'compliance' | 'system' | 'cms' | 'api'>('overview');
  const [statsRange, setStatsRange] = useState<'week' | 'month' | 'all'>('week');
  
  // CMS state values
  const [cmsForm, setCmsForm] = useState<any>({});
  const [cmsSaveSuccess, setCmsSaveSuccess] = useState(false);

  // API configuration forms
  const [apiForm, setApiForm] = useState<any>({
    apiUsdToAoa: 920,
    apiPriceDataSource: 'BINANCE',
    apiBinanceIntervalMs: 8500,
    apiCustomJustification: ''
  });
  const [apiSaveSuccess, setApiSaveSuccess] = useState(false);

  // Real-time connection diagnostic tester state
  const [connectionTest, setConnectionTest] = useState<{
    status: 'IDLE' | 'TESTING' | 'SUCCESS' | 'FAILED';
    latency: number | null;
    message: string | null;
    sample: string | null;
  }>({
    status: 'IDLE',
    latency: null,
    message: null,
    sample: null
  });

  useEffect(() => {
    if (platformConfig) {
      setCmsForm({
        heroBadge: platformConfig.heroBadge || '',
        heroTitle: platformConfig.heroTitle || '',
        heroSubtitle: platformConfig.heroSubtitle || '',
        heroCta1: platformConfig.heroCta1 || '',
        heroCta2: platformConfig.heroCta2 || '',
        stat1Title: platformConfig.stat1Title || '',
        stat1Value: platformConfig.stat1Value || '',
        stat2Title: platformConfig.stat2Title || '',
        stat2Value: platformConfig.stat2Value || '',
        stat3Title: platformConfig.stat3Title || '',
        stat3Value: platformConfig.stat3Value || '',
        stat4Title: platformConfig.stat4Title || '',
        stat4Value: platformConfig.stat4Value || '',
        simBadge: platformConfig.simBadge || '',
        simTitle: platformConfig.simTitle || '',
        simSubtitle: platformConfig.simSubtitle || '',
        benefitsBadge: platformConfig.benefitsBadge || '',
        benefitsTitle: platformConfig.benefitsTitle || '',
        benefitsSubtitle: platformConfig.benefitsSubtitle || '',
        benefit1Title: platformConfig.benefit1Title || '',
        benefit1Desc: platformConfig.benefit1Desc || '',
        benefit2Title: platformConfig.benefit2Title || '',
        benefit2Desc: platformConfig.benefit2Desc || '',
        benefit3Title: platformConfig.benefit3Title || '',
        benefit3Desc: platformConfig.benefit3Desc || '',
        banksSubtitle: platformConfig.banksSubtitle || '',
        faqTitle: platformConfig.faqTitle || '',
        faqSubtitle: platformConfig.faqSubtitle || '',
        faq1Question: platformConfig.faq1Question || '',
        faq1Answer: platformConfig.faq1Answer || '',
        faq2Question: platformConfig.faq2Question || '',
        faq2Answer: platformConfig.faq2Answer || '',
        faq3Question: platformConfig.faq3Question || '',
        faq3Answer: platformConfig.faq3Answer || '',
        footerRiskWarning: platformConfig.footerRiskWarning || ''
      });
      setApiForm({
        apiUsdToAoa: platformConfig.apiUsdToAoa ?? 920,
        apiPriceDataSource: platformConfig.apiPriceDataSource ?? 'BINANCE',
        apiBinanceIntervalMs: platformConfig.apiPriceDataSource === 'SIMULATOR' ? 8500 : (platformConfig.apiBinanceIntervalMs ?? 8500),
        apiCustomJustification: platformConfig.apiCustomJustification ?? 'Sistema operando normalmente. Conexão direta com a rede Binance e cotação em tempo real.'
      });
    }
  }, [platformConfig]);

  const handleSaveCMS = async () => {
    try {
      await adminConfigurePlatformSetting(cmsForm);
      setCmsSaveSuccess(true);
      setTimeout(() => setCmsSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao guardar CMS:", err);
    }
  };

  const handleSaveAPI = async () => {
    try {
      await adminConfigurePlatformSetting({
        apiUsdToAoa: Number(apiForm.apiUsdToAoa ?? 920),
        apiPriceDataSource: apiForm.apiPriceDataSource ?? 'BINANCE',
        apiBinanceIntervalMs: Number(apiForm.apiBinanceIntervalMs ?? 8500),
        apiCustomJustification: apiForm.apiCustomJustification ?? ''
      });
      setApiSaveSuccess(true);
      setTimeout(() => setApiSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao guardar API Config:", err);
    }
  };

  const handleTestConnection = async () => {
    setConnectionTest({
      status: 'TESTING',
      latency: null,
      message: 'Iniciando teste de handshake e latência com os servidores mundiais da Binance...',
      sample: null
    });
    const startTime = Date.now();
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
      const latency = Date.now() - startTime;
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} [${res.statusText}]`);
      }
      const data = await res.json() as any;
      setConnectionTest({
        status: 'SUCCESS',
        latency,
        message: 'Conectividade e handshake concluídos com latência reduzida no servidor de Angola.',
        sample: JSON.stringify(data, null, 2)
      });
    } catch (err: any) {
      const latency = Date.now() - startTime;
      setConnectionTest({
        status: 'FAILED',
        latency,
        message: `Falha na solicitação HTTP: ${err?.message || 'Servidor inalcançável ou limite de taxa excedido.'}`,
        sample: null
      });
    }
  };
  
  // Completed Transactions Filters
  const [txSearchQuery, setTxSearchQuery] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAW'>('ALL');
  
  // User Search and Filter
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'ALL' | 'VERIFIED' | 'UNVERIFIED' | 'BLOCKED'>('ALL');

  // Simulated live feed of online users' activity in Angola
  const [liveLog, setLiveLog] = useState<any[]>(() => [
    { id: '1', name: 'Gelson Dias', location: 'Luanda', action: 'abriu contrato de COMPRA no BTC/AOA', type: 'trade_win', amount: 5000, time: 'Agora mesmo' },
    { id: '2', name: 'Sandra Kiala', location: 'Benguela', action: 'concluiu verificação biométrica de identidade', type: 'verification', time: 'Há 1 min' },
    { id: '3', name: 'Mateus Castro', location: 'Cabinda', action: 'depositou fundos via Multicaixa', type: 'deposit', amount: 45050, time: 'Há 3 min' },
    { id: '4', name: 'Amélia Neto', location: 'Lubango', action: 'concluiu trade com lucro de +80%', type: 'trade_win', amount: 15400, time: 'Há 5 min' },
    { id: '5', name: 'Filipe João', location: 'Huambo', action: 'solicitou levantamento expresso', type: 'withdrawal', amount: 30000, time: 'Há 7 min' }
  ]);

  const getUserSimulatedMeta = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    
    const locations = ['Luanda', 'Benguela', 'Cabinda', 'Lubango', 'Huambo', 'Malanje', 'Soyo', 'Lobito'];
    const browsers = ['Safari Mobile (iPhone)', 'Chrome (Windows)', 'Opera Mini', 'Android WebView', 'Firefox (MacOS)'];
    
    const location = locations[absHash % locations.length];
    const browser = browsers[absHash % browsers.length];
    const ip = `102.223.${96 + (absHash % 12)}.${10 + (absHash % 240)}`;
    
    const userTrades = trades.filter(t => t.userId === userId);
    const closedTrades = userTrades.filter(t => t.status === 'CLOSED');
    const winningTrades = closedTrades.filter(t => t.profit > 0);
    const winRate = closedTrades.length > 0 
      ? Math.round((winningTrades.length / closedTrades.length) * 100) 
      : 0;

    return {
      location,
      browser,
      ip,
      totalTrades: userTrades.length,
      winRate
    };
  };

  const getOverviewData = () => {
    const now = Date.now();
    const chartData: any[] = [];
    const spreadPct = platformConfig.brokerSpreadPercentage ?? 5;
    
    if (statsRange === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString('pt-AO', { weekday: 'short' });
        const label = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1, 3);

        const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
        
        const dayTrades = trades.filter(t => t.openTime >= startOfDay && t.openTime < endOfDay);
        
        let baseGanhosAdm = 45000 + (Math.sin((6-i) * 1.5) + i * 0.2) * 12000;
        let basePerdasAdm = 28000 + (Math.cos((6-i) * 1.2) + i * 0.1) * 8000;
        let baseGanhosClientes = basePerdasAdm;

        if (dayTrades.length > 0) {
          const realLosses = dayTrades
            .filter(t => t.status === 'CLOSED' && t.profit < 0)
            .reduce((sum, t) => sum + Math.abs(t.profit), 0);
          
          const realSpread = dayTrades.reduce((sum, t) => sum + (t.quantity || 0), 0) * (spreadPct / 100);
          const realWins = dayTrades
            .filter(t => t.status === 'CLOSED' && t.profit > 0)
            .reduce((sum, t) => sum + t.profit, 0);
          
          baseGanhosAdm += realLosses + realSpread;
          basePerdasAdm += realWins;
          baseGanhosClientes += realWins;
        }

        chartData.push({
          name: label,
          'Lucro ADM (Kz)': Math.round(baseGanhosAdm),
          'Perdas ADM (Kz)': Math.round(basePerdasAdm),
          'Margem Autónoma (Kz)': Math.round(baseGanhosAdm - basePerdasAdm),
          'Clientes Lucro (Kz)': Math.round(baseGanhosClientes)
        });
      }
    } else if (statsRange === 'month') {
      for (let i = 3; i >= 0; i--) {
        const startWeek = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
        const endWeek = now - i * 7 * 24 * 60 * 60 * 1000;
        
        const weekTrades = trades.filter(t => t.openTime >= startWeek && t.openTime < endWeek);
        
        let baseGanhosAdm = 210000 + (Math.sin(i * 2.1) + 1.2) * 45000;
        let basePerdasAdm = 140000 + (Math.cos(i * 1.8) + 1.0) * 30000;
        let baseGanhosClientes = basePerdasAdm;

        if (weekTrades.length > 0) {
          const realLosses = weekTrades
            .filter(t => t.status === 'CLOSED' && t.profit < 0)
            .reduce((sum, t) => sum + Math.abs(t.profit), 0);
          
          const realSpread = weekTrades.reduce((sum, t) => sum + (t.quantity || 0), 0) * (spreadPct / 100);
          const realWins = weekTrades
            .filter(t => t.status === 'CLOSED' && t.profit > 0)
            .reduce((sum, t) => sum + t.profit, 0);
          
          baseGanhosAdm += realLosses + realSpread;
          basePerdasAdm += realWins;
          baseGanhosClientes += realWins;
        }

        chartData.push({
          name: `Semana ${4 - i}`,
          'Lucro ADM (Kz)': Math.round(baseGanhosAdm),
          'Perdas ADM (Kz)': Math.round(basePerdasAdm),
          'Margem Autónoma (Kz)': Math.round(baseGanhosAdm - basePerdasAdm),
          'Clientes Lucro (Kz)': Math.round(baseGanhosClientes)
        });
      }
    } else {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      for (let i = 5; i >= 0; i--) {
        const startMonth = now - (i + 1) * 30 * 24 * 60 * 60 * 1000;
        const endMonth = now - i * 30 * 24 * 60 * 60 * 1000;
        
        const monthTrades = trades.filter(t => t.openTime >= startMonth && t.openTime < endMonth);
        
        let baseGanhosAdm = 920000 + (Math.sin(i * 1.0) + 1.0) * 150000;
        let basePerdasAdm = 610000 + (Math.cos(i * 0.9) + 1.0) * 95000;
        let baseGanhosClientes = basePerdasAdm;

        if (monthTrades.length > 0) {
          const realLosses = monthTrades
            .filter(t => t.status === 'CLOSED' && t.profit < 0)
            .reduce((sum, t) => sum + Math.abs(t.profit), 0);
          
          const realSpread = monthTrades.reduce((sum, t) => sum + (t.quantity || 0), 0) * (spreadPct / 100);
          const realWins = monthTrades
            .filter(t => t.status === 'CLOSED' && t.profit > 0)
            .reduce((sum, t) => sum + t.profit, 0);
          
          baseGanhosAdm += realLosses + realSpread;
          basePerdasAdm += realWins;
          baseGanhosClientes += realWins;
        }

        chartData.push({
          name: months[5 - i] || `Mes ${6-i}`,
          'Lucro ADM (Kz)': Math.round(baseGanhosAdm),
          'Perdas ADM (Kz)': Math.round(basePerdasAdm),
          'Margem Autónoma (Kz)': Math.round(baseGanhosAdm - basePerdasAdm),
          'Clientes Lucro (Kz)': Math.round(baseGanhosClientes)
        });
      }
    }
    
    return chartData;
  };

  // Periodic simulated log pushes to make the dashboard feel alive and interactive!
  useEffect(() => {
    const angolanNames = [
      'Lucas Neto', 'Sílvia Costa', 'Amílcar Baptista', 'Claudio Santos', 'Mariana Jorge',
      'Pedro Cabral', 'Eunice Ventura', 'Gerson Silva', 'Helder Manuel', 'Janice Cruz',
      'Valter Cardoso', 'Catarina Diogo', 'Domingos Antunes', 'Isabel Ndala', 'António Benguela'
    ];
    const angolanProvinces = [
      'Luanda', 'Benguela', 'Cabinda', 'Huambo', 'Huíla', 'Namibe', 'Uíge', 'Malanje', 'Cuanza Sul'
    ];
    const activities = [
      { action: 'abriu contrato de VENDA no ETH/AOA', type: 'trade_loss', amount: 8000 },
      { action: 'abriu contrato de COMPRA no BTC/AOA', type: 'trade_win', amount: 12000 },
      { action: 'solicitou levantamento bancário para conta BFA', type: 'withdrawal', amount: 25000 },
      { action: 'depositou fundos via transferência instantânea', type: 'deposit', amount: 50000 },
      { action: 'concluiu contrato com lucro de +180%', type: 'trade_win', amount: 20000 },
      { action: 'assinou termo de conformidade digital', type: 'verification' },
      { action: 'fez login via dispositivo móvel Unitel', type: 'verification' }
    ];

    const logInterval = setInterval(() => {
      const randomName = angolanNames[Math.floor(Math.random() * angolanNames.length)];
      const randomProvince = angolanProvinces[Math.floor(Math.random() * angolanProvinces.length)];
      const randomAct = activities[Math.floor(Math.random() * activities.length)];

      const newLog = {
        id: `activity-${Date.now()}`,
        name: randomName,
        location: randomProvince,
        action: randomAct.action,
        type: randomAct.type,
        amount: randomAct.amount,
        time: 'Agora mesmo'
      };

      setLiveLog(prev => {
        const nextLogs = prev.map(log => {
          if (log.time === 'Agora mesmo') return { ...log, time: 'Há 1 min' };
          if (log.time === 'Há 1 min') return { ...log, time: 'Há 2 min' };
          if (log.time.startsWith('Há ')) {
            const minutes = parseInt(log.time.split(' ')[1]) || 2;
            return { ...log, time: `Há ${minutes + 1} min` };
          }
          return log;
        });
        return [newLog, ...nextLogs.slice(0, 11)];
      });
    }, 4500);

    return () => clearInterval(logInterval);
  }, []);

  // Create Asset Form state
  const [newAssetSymbol, setNewAssetSymbol] = useState('');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState<AssetCategory>('shares');
  const [newAssetPrice, setNewAssetPrice] = useState(15000);
  const [newAssetDesc, setNewAssetDesc] = useState('');
  
  // Custom manual price edit mapping
  const [manualPrices, setManualPrices] = useState<Record<string, number>>({});
 
  // Direct cash inject states
  const [cashInjectAmount, setCashInjectAmount] = useState<Record<string, string>>({});

  const handleCreateAssetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetSymbol || !newAssetName) return;
    
    adminCreateAsset({
      symbol: newAssetSymbol.toUpperCase(),
      name: newAssetName,
      category: newAssetCategory,
      price: newAssetPrice,
      description: newAssetDesc || 'Ativo digital criptoativo.',
      volume: '150K AOA',
      high: newAssetPrice,
      low: newAssetPrice
    });

    // reset keys
    setNewAssetSymbol('');
    setNewAssetName('');
    setNewAssetPrice(15000);
    setNewAssetDesc('');
  };

  const handlePriceManualAdjust = (assetId: string) => {
    const targetPrice = manualPrices[assetId];
    if (targetPrice && targetPrice > 0) {
      adminUpdateAssetPrice(assetId, targetPrice);
      // feedback animation can occur
    }
  };

  const handleCashInject = (userId: string, isDemo: boolean) => {
    const rawValue = cashInjectAmount[`${userId}-${isDemo ? 'demo' : 'live'}`];
    const numericValue = parseFloat(rawValue);
    if (!isNaN(numericValue)) {
      adminAdjustUserBalance(userId, numericValue, isDemo);
    }
  };

  // Filter pending vs completed transacts
  const pendingTx = transactions.filter(t => t.status === 'PENDING');
  const completedTx = transactions.filter(t => t.status !== 'PENDING');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/80">
      
      {/* Workspace Flex Container with Sidebar */}
      <div className="flex flex-col md:flex-row min-h-[700px] select-none">
        
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/80 p-5 flex flex-col gap-5 select-none">
          
          {/* Quick Platform Mini Stats */}
          <div className="hidden md:block bg-slate-900/50 rounded-xl p-4 border border-slate-800/60">
            <div className="flex items-center gap-2 mb-2.5">
              <Activity size={14} className="text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Painel Operacional</span>
            </div>
            <div className="flex justify-between items-end gap-2">
              <div>
                <span className="text-[9px] text-slate-500 font-semibold uppercase block">Online Agora</span>
                <span className="text-xl font-display font-black text-emerald-400 leading-none">
                  {onlineUsersCount ?? 3}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 font-semibold uppercase block">Investidores</span>
                <span className="text-md font-display font-bold text-slate-200 leading-none">
                  {users.filter(u => u.role !== 'admin').length}
                </span>
              </div>
            </div>
          </div>

          {/* Vertical Navigation Buttons */}
          <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1 text-left">
            
            {/* Group 1: MONITORIZAÇÃO */}
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest pl-2 mt-2 mb-1 block">
              Monitorização
            </span>

            {/* button 1 */}
            <button
              id="admin-overview-tab"
              onClick={() => setActiveTab('overview')}
              className={`w-full py-2.5 px-3 text-xs font-semibold font-display rounded-xl flex items-center gap-2.5 transition-all outline-none ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <BarChart3 size={15} className={activeTab === 'overview' ? 'text-slate-950' : 'text-slate-500'} />
              <span>Painel Estatístico</span>
            </button>

            {/* button 5 */}
            <button
              id="admin-traffic-tab"
              onClick={() => setActiveTab('traffic')}
              className={`w-full py-2.5 px-3 text-xs font-semibold font-display rounded-xl flex items-center gap-2.5 transition-all outline-none ${
                activeTab === 'traffic'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Activity size={15} className={activeTab === 'traffic' ? 'text-slate-950 animate-pulse' : 'text-emerald-400 animate-pulse'} />
              <span>Tráfego & Simulador</span>
            </button>

            {/* Group 2: GESTÃO OPERACIONAL */}
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest pl-2 mt-4 mb-1 block">
              Gestão Operacional
            </span>

            {/* button 2 */}
            <button
              id="admin-users-tab"
              onClick={() => setActiveTab('users')}
              className={`w-full py-2.5 px-3 text-xs font-semibold font-display rounded-xl flex items-center justify-between gap-2.5 transition-all outline-none ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users size={15} className={activeTab === 'users' ? 'text-slate-950' : 'text-slate-500'} />
                <span>Utilizadores & Risco</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'users' ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                {users.length}
              </span>
            </button>

            {/* button 3 */}
            <button
              id="admin-transactions-tab"
              onClick={() => setActiveTab('transactions')}
              className={`w-full py-2.5 px-3 text-xs font-semibold font-display rounded-xl flex items-center justify-between gap-2.5 transition-all outline-none ${
                activeTab === 'transactions'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Landmark size={15} className={activeTab === 'transactions' ? 'text-slate-950' : 'text-slate-500'} />
                <span>Movimentos Bancários</span>
              </div>
              {pendingTx.length > 0 && (
                <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded-full animate-bounce">
                  {pendingTx.length}
                </span>
              )}
            </button>

            {/* button 6 */}
            <button
              id="admin-compliance-tab"
              onClick={() => setActiveTab('compliance')}
              className={`w-full py-2.5 px-3 text-xs font-semibold font-display rounded-xl flex items-center justify-between gap-2.5 transition-all outline-none ${
                activeTab === 'compliance'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Fingerprint size={15} className={activeTab === 'compliance' ? 'text-slate-950' : 'text-slate-500'} />
                <span>Conformidade BI</span>
              </div>
              {users.filter(u => u.verificationStatus === 'PENDING').length > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[9px] font-extrabold rounded-full animate-pulse font-mono leading-none">
                  {users.filter(u => u.verificationStatus === 'PENDING').length}
                </span>
              )}
            </button>

            {/* Group 3: PARAMETRIZAÇÃO & WEB CMS */}
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest pl-2 mt-4 mb-1 block">
              Configuração & Landing
            </span>

            {/* button 4 */}
            <button
              id="admin-market-tab"
              onClick={() => setActiveTab('market')}
              className={`w-full py-2.5 px-3 text-xs font-semibold font-display rounded-xl flex items-center justify-between gap-2.5 transition-all outline-none ${
                activeTab === 'market'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Settings size={15} className={activeTab === 'market' ? 'text-slate-950' : 'text-slate-500'} />
                <span>Ativos & Payouts</span>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'market' ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400 border border-slate-800 font-mono'}`}>
                {assets.length}
              </span>
            </button>

            {/* New CMS Button */}
            <button
              id="admin-cms-tab"
              onClick={() => setActiveTab('cms')}
              className={`w-full py-2.5 px-3 text-xs font-semibold font-display rounded-xl flex items-center gap-2.5 transition-all outline-none ${
                activeTab === 'cms'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <FileText size={15} className={activeTab === 'cms' ? 'text-slate-950' : 'text-slate-500'} />
              <span>Gestão Web (CMS)</span>
            </button>

            {/* API Config Button */}
            <button
              id="admin-api-tab"
              onClick={() => setActiveTab('api')}
              className={`w-full py-2.5 px-3 text-xs font-semibold font-display rounded-xl flex items-center justify-between gap-2.5 transition-all outline-none ${
                activeTab === 'api'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Cpu size={15} className={activeTab === 'api' ? 'text-slate-950 animate-pulse' : 'text-slate-500'} />
                <span>API CONFIG</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${
                (platformConfig.apiPriceDataSource ?? 'BINANCE') === 'BINANCE'
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900/50'
                  : 'bg-amber-950/80 text-amber-400 border border-amber-900/50'
              }`}>
                {platformConfig.apiPriceDataSource ?? 'BINANCE'}
              </span>
            </button>

            {/* button 7: Configurações do Sistema */}
            <button
              id="admin-system-tab"
              onClick={() => setActiveTab('system')}
              className={`w-full py-2.5 px-3 text-xs font-semibold font-display rounded-xl flex items-center justify-between gap-2.5 transition-all outline-none ${
                activeTab === 'system'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders size={15} className={activeTab === 'system' ? 'text-slate-950' : 'text-slate-500'} />
                <span>Ajustes do Sistema</span>
              </div>
              {platformConfig.maintenanceMode && (
                <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-bold rounded-full animate-pulse font-mono block">
                  MANUT.
                </span>
              )}
            </button>

          </div>

          {/* Bottom Operator session box inside Sidebar */}
          <div className="hidden md:block mt-auto p-4 bg-slate-900/40 rounded-xl border border-slate-800/40">
            <span className="text-[9px] text-slate-500 font-bold uppercase block tracking-wider mb-1.5">Ligação Segura</span>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Admin Boss Mode</div>
            </div>
            <p className="text-[10px] text-slate-500/90 leading-relaxed">As alterações ao controlo de risco e aos saldos atualizam imediatamente o terminal do utilizador.</p>
          </div>

        </div>

        {/* Dynamic content view container */}
        <div className="flex-1 p-6 overflow-x-hidden md:p-8">

        {/* UPPER INTELLIGENCE METRICS DECK */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 select-none">
          
          {/* Card 1: Total Users */}
          <div 
            onClick={() => setActiveTab('users')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 hover:bg-slate-900/30 transition-all shadow-lg relative overflow-hidden group cursor-pointer active:scale-97"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Utilizadores</span>
              <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400">
                <Users size={14} />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-display font-extrabold text-white tracking-tight">
                {users.filter(u => u.role !== 'admin').length}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Contas registadas</p>
            </div>
          </div>

          {/* Card 2: Verified Users (Aprovados) */}
          <div 
            onClick={() => setActiveTab('compliance')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 hover:bg-slate-900/30 transition-all shadow-lg relative overflow-hidden group cursor-pointer active:scale-97"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 opacity-80" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Verificados BI</span>
              <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                <ShieldCheck size={14} />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-display font-extrabold text-emerald-400 tracking-tight">
                {users.filter(u => u.role !== 'admin' && u.verificationStatus === 'APPROVED').length}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Contas validadas</p>
            </div>
          </div>

          {/* Card 3: Unverified Users (Não Aprovados / Pendentes) */}
          <div 
            onClick={() => setActiveTab('compliance')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 hover:bg-slate-900/30 transition-all shadow-lg relative overflow-hidden group cursor-pointer active:scale-97"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-amber-500 to-red-500 opacity-80" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Não Verificados</span>
              <div className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
                <AlertTriangle size={14} />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-display font-extrabold text-amber-400 tracking-tight">
                {users.filter(u => u.role !== 'admin' && u.verificationStatus !== 'APPROVED').length}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Por certificar ou pendentes</p>
            </div>
          </div>

          {/* Card 4: Custodial Liquidity (Saldos sob Custódia) */}
          <div 
            onClick={() => setActiveTab('transactions')}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 hover:bg-slate-900/30 transition-all shadow-lg relative overflow-hidden group cursor-pointer active:scale-97"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-80" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldos Reais</span>
              <div className="w-7 h-7 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400">
                <Landmark size={14} />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-lg font-mono font-extrabold text-cyan-400 tracking-tight truncate">
                {formatKz(users.filter(u => u.role !== 'admin').reduce((sum, u) => sum + u.balance, 0))}
              </h4>
              <p className="text-[9px] text-slate-500 mt-1 font-mono truncate">
                Demo: {formatKz(users.filter(u => u.role !== 'admin').reduce((sum, u) => sum + u.demoBalance, 0))}
              </p>
            </div>
          </div>

          {/* Card 5: User Accumulated Gains (Valores já ganhos aos usuários) */}
          <div 
            onClick={() => {
              setActiveTab('overview');
              setTimeout(() => {
                document.getElementById('perf-clientes')?.scrollIntoView({ behavior: 'smooth' });
              }, 150);
            }}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-600 hover:bg-slate-900/30 transition-all shadow-lg relative overflow-hidden group cursor-pointer active:scale-97"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-violet-500 to-purple-500 opacity-80" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Ganhos Clientes</span>
              <div className="w-7 h-7 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400">
                <Coins size={14} />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-lg font-mono font-extrabold text-purple-400 tracking-tight truncate">
                {formatKz(trades
                  .filter(t => t.status === 'CLOSED' && t.profit > 0)
                  .reduce((sum, t) => sum + t.profit, 0))}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Soma de mais-valias líquidas</p>
            </div>
          </div>

          {/* Card 6: Admin Accumulated Revenue (Valores já ganho do ADM) */}
          <div 
            onClick={() => {
              setActiveTab('overview');
              setTimeout(() => {
                document.getElementById('perf-corretor')?.scrollIntoView({ behavior: 'smooth' });
              }, 150);
            }}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between hover:border-slate-750 transition-all shadow-lg relative overflow-hidden group cursor-pointer active:scale-97"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500 to-amber-500 opacity-80 animate-pulse" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-455 uppercase tracking-widest">Lucro do Corretor (Adm)</span>
              <div className="w-7 h-7 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-500">
                <Receipt size={14} />
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-lg font-mono font-extrabold text-rose-500 tracking-tight truncate">
                {formatKz(
                  trades
                    .filter(t => t.status === 'CLOSED' && t.profit < 0)
                    .reduce((sum, t) => sum + Math.abs(t.profit), 0) + 
                  trades.reduce((sum, t) => sum + (t.quantity || 0), 0) * ((platformConfig.brokerSpreadPercentage ?? 5) / 100)
                )}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">
                Perdas + {platformConfig.brokerSpreadPercentage ?? 5}% Spread Operacional
              </p>
            </div>
          </div>
        </div>
        )}

        {/* SUB-SECTION 0: OVERVIEW & ESTATÍSTICAS DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in text-left">
            
            {/* Range and Info Control Bar */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="text-amber-500 animate-pulse" size={16} />
                  Painel de Estatísticas & Rendimento da Corretora
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Análise integrada de perdas dos clientes, volumes do spread operacional de {platformConfig.brokerSpreadPercentage ?? 5}% e balanços em tempo real da KzOption.
                </p>
              </div>

              {/* Range Filters */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1 select-none">
                {(['week', 'month', 'all'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setStatsRange(range)}
                    className={`text-[10px] font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                      statsRange === range
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {range === 'week' ? 'Esta Semana' : range === 'month' ? 'Este Mês' : 'Todo o Período'}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations derived from range */}
            {(() => {
              const chartData = getOverviewData();
              const totalIndexGanhosAdm = chartData.reduce((sum, d) => sum + d['Lucro ADM (Kz)'], 0);
              const totalIndexPerdasAdm = chartData.reduce((sum, d) => sum + d['Perdas ADM (Kz)'], 0);
              const totalIndexNet = totalIndexGanhosAdm - totalIndexPerdasAdm;
              const totalIndexClientes = chartData.reduce((sum, d) => sum + d['Clientes Lucro (Kz)'], 0);

              return (
                <>
                  {/* Performance Indicators Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none">Ganhos ADM ({statsRange === 'week' ? 'Semanais' : statsRange === 'month' ? 'Mensais' : 'Total'})</p>
                      <h4 className="text-2xl font-mono font-bold text-emerald-400 mt-2">
                        {formatKz(totalIndexGanhosAdm)}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 border-t border-slate-900 pt-1.5 font-sans">Apostas perdidas + 5% Spread</p>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none">Perdas do ADM (Payouts)</p>
                      <h4 className="text-2xl font-mono font-bold text-rose-500 mt-2">
                        {formatKz(totalIndexPerdasAdm)}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 border-t border-slate-900 pt-1.5 font-sans">Saldos pagos a traders vencedores</p>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none">Lucro Líquido Real ADM</p>
                      <h4 className={`text-2xl font-mono font-bold mt-2 ${totalIndexNet >= 0 ? 'text-cyan-400' : 'text-red-500'}`}>
                        {formatKz(totalIndexNet)}
                      </h4>
                      <p className="text-[10px] text-slate-550 mt-1 border-t border-slate-900 pt-1.5 font-sans">Margem líquida da corretora</p>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850">
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none font-sans">Ganhos Totais dos Clientes</p>
                      <h4 className="text-2xl font-mono font-bold text-amber-500 mt-2">
                        {formatKz(totalIndexClientes)}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 border-t border-slate-900 pt-1.5 font-sans">Volume de lucro dos utilizadores</p>
                    </div>
                  </div>

                  {/* Two Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Chart 1: Broker performance */}
                    <div id="perf-corretor" className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                      <div>
                        <h4 className="font-display font-medium text-xs text-white uppercase tracking-wide flex items-center gap-1.5">
                          <TrendingUp size={14} className="text-emerald-400" />
                          Rendimento do Corretor (Ganhos vs Perdas)
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Visão detalhada de ingressos em caixa vs payouts de licitação</p>
                      </div>

                      <div className="h-64 pricing-chart">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorGanhosAdm" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorPerdasAdm" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }}
                              labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                              itemStyle={{ fontSize: '11px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Area type="monotone" dataKey="Lucro ADM (Kz)" name="Ganhos ADM" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGanhosAdm)" />
                            <Area type="monotone" dataKey="Perdas ADM (Kz)" name="Perdas (Payouts)" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorPerdasAdm)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Chart 2: Customer earnings */}
                    <div id="perf-clientes" className="bg-slate-950 p-5 rounded-2xl border border-slate-850 space-y-4">
                      <div>
                        <h4 className="font-display font-medium text-xs text-white uppercase tracking-wide flex items-center gap-1.5">
                          <Coins size={14} className="text-amber-500" />
                          Ganhos de Clientes (Mais-valias dos Traders)
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Evolução de acúmulo de lucros de traders ativos na plataforma</p>
                      </div>

                      <div className="h-64 pricing-chart">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorGanhosClientes" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '8px' }}
                              labelStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                              itemStyle={{ fontSize: '11px' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                            <Area type="monotone" dataKey="Clientes Lucro (Kz)" name="Ganhos de Clientes" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGanhosClientes)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                  {/* Ver Todos os Utilizadores CTA */}
                  <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 text-center space-y-3.5 mt-2">
                    <div className="max-w-xl mx-auto space-y-1">
                      <h4 className="font-display font-bold text-sm text-amber-500">Diretório Central de Contas Registadas</h4>
                      <p className="text-xs text-slate-400">
                        Gerencie saldos reais de forma direta, configure regras de risco, verifique ou rejeite provas digitais de identificação de cidadãos angolanos.
                      </p>
                    </div>
                    <button
                      id="view-all-users-cta"
                      onClick={() => setActiveTab('users')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-amber-500/15 cursor-pointer mx-auto flex items-center justify-center gap-1.5"
                    >
                      <Users size={14} />
                      Ver Todos os Utilizadores ({users.length})
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* SUB-SECTION 1: USER CONTROL LIST & PROBABILITIES SETTINGS */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-left">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-150 uppercase tracking-wide">Gestão de Risco e Configuração de Probabilidades</h3>
                <p className="text-[11px] text-slate-500">Configure balanceamentos, status de conta criminalístico e regras de vitória das contas registradas.</p>
              </div>
            </div>

            {/* Global Probability Control Card */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-rose-500/10 shadow-md relative overflow-hidden text-left space-y-4">
              <div className="absolute top-0 right-0">
                <span className="text-[9px] bg-rose-950/20 text-rose-450 border border-thin border-rose-500/20 px-3 py-1 rounded-bl-xl font-mono uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  Risco de Rede Global
                </span>
              </div>

              <div>
                <h4 className="font-display font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders size={14} className="text-rose-500" />
                  Manipular Probabilidade Ganhos GERAL (Para Todos os Utilizadores)
                </h4>
                <p className="text-[11px] text-slate-450 mt-1">
                  Defina a taxa de vitória padrão para todas as operações binárias e lucros de contrato de todos os usuários de forma simultânea. Quando ativado, este valor substitui as configurações de qualquer conta.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 select-none">
                {[
                  { value: 0, label: '📋 Usar Configurações Individuais' },
                  { value: 10, label: 'Dreno de Banca' },
                  { value: 35, label: 'Dreno Controlado' },
                  { value: 65, label: 'Mercado Balanceado' },
                  { value: 95, label: 'Vitória Garantida' }
                ].map(opt => {
                  const isActive = (platformConfig.globalWinProbability ?? 0) === opt.value;
                  return (
                    <button
                      key={opt.value}
                      id={`global-prob-btn-${opt.value}`}
                      onClick={() => adminConfigurePlatformSetting({ globalWinProbability: opt.value })}
                      className={`text-[10px] font-bold p-3.5 rounded-xl border transition-all text-center flex flex-col justify-center items-center gap-1 cursor-pointer ${
                        isActive
                          ? 'bg-rose-500 text-slate-950 border-rose-400 scale-102 shadow-md shadow-rose-500/10'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      <span className="font-mono text-xs">{opt.value === 0 ? 'DESATIVADO' : `${opt.value}%`}</span>
                      <span className="text-[8px] opacity-85 uppercase mt-0.5">{opt.value === 0 ? 'Individual' : opt.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[10px] bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-slate-400 leading-relaxed font-semibold">
                📢 <strong className="text-white">Probabilidade Ativa Actual:</strong> Presentemente, {
                  (platformConfig.globalWinProbability ?? 0) === 0 
                    ? "o sistema está de acordo com as probabilidades configuradas em cada conta de utilizador individualmente abaixo." 
                    : `todas as ordens abertas por qualquer cliente têm probabilidade fixa de ${platformConfig.globalWinProbability}% de sair vencedoras.`
                }
              </div>
            </div>

            {/* User Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="user-search-input"
                  type="text"
                  placeholder="Procurar por nome, apelido, email ou ID..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 w-full focus:outline-none focus:border-amber-500"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={13} className="text-slate-400" />
                <label htmlFor="user-filter-select" className="text-xs text-slate-400 whitespace-nowrap">Filtro Rápido:</label>
                <select
                  id="user-filter-select"
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value as any)}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-amber-500 w-full sm:w-48 font-semibold"
                >
                  <option value="ALL">Todos Utilizadores</option>
                  <option value="VERIFIED">BI Verificado (Aprovados)</option>
                  <option value="UNVERIFIED">Aguardando BI / Pendentes</option>
                  <option value="BLOCKED">Bloqueados de Negociar</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3.5">
              {(() => {
                const filteredUsers = users.filter(u => {
                  const matchesSearch = u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                                        u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
                  if (userStatusFilter === 'VERIFIED') {
                    return matchesSearch && u.verificationStatus === 'APPROVED';
                  }
                  if (userStatusFilter === 'UNVERIFIED') {
                    return matchesSearch && u.verificationStatus !== 'APPROVED';
                  }
                  if (userStatusFilter === 'BLOCKED') {
                    return matchesSearch && u.isBlocked;
                  }
                  return matchesSearch;
                });

                if (filteredUsers.length === 0) {
                  return (
                    <div className="border border-dashed border-slate-800 bg-slate-950/20 rounded-2xl p-12 text-center text-xs text-slate-500">
                      Nenhum utilizador encontrado com os filtros selecionados. Modifique os termos de busca de "{userSearchQuery || 'Pesquisa'}".
                    </div>
                  );
                }

                return filteredUsers.map(user => {
                  const liveWeight = `${user.id}-live`;
                  const demoWeight = `${user.id}-demo`;

                  return (
                    <div key={user.id} className="bg-slate-950 rounded-2xl border border-slate-850 p-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-5">
                      
                      {/* User info columns */}
                      <div className="w-full xl:w-1/4 space-y-2 text-left">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${user.isBlocked ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="font-display font-bold text-white text-sm">{user.name}</span>
                            {user.role === 'admin' && (
                              <span className="text-[9px] bg-red-600/15 text-red-500 font-bold px-1.5 py-0.5 rounded">ADMINISTRAÇÃO</span>
                            )}
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 mt-1">{user.email}</p>
                        </div>

                        {(() => {
                          const meta = getUserSimulatedMeta(user.id);
                          return (
                            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-[10px]">
                              <div className="flex items-center justify-between text-slate-400 font-mono">
                                <span className="flex items-center gap-1"><MapPin size={10} className="text-amber-500" /> {meta.location}, AO</span>
                                <span className="text-slate-300 font-bold">{meta.ip}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-400 font-sans">
                                <span className="flex items-center gap-1 text-[9px] truncate"><Smartphone size={10} className="text-slate-500 shrink-0" /> {meta.browser}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-500 border-t border-slate-800/50 pt-1.5 leading-none">
                                <span>Operações: <strong className="text-slate-300 font-mono font-medium">{meta.totalTrades}</strong></span>
                                <span>Aproveitamento: <strong className="text-emerald-400 font-mono font-extrabold">{meta.winRate}%</strong></span>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex flex-wrap gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            user.verificationStatus === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400' :
                            user.verificationStatus === 'PENDING' ? 'bg-amber-500/15 text-amber-400' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {user.verificationStatus === 'APPROVED' ? 'BI Validado' :
                             user.verificationStatus === 'PENDING' ? 'Análise de BI Pendente' :
                             'BI Sem Envio'}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 py-0.5">
                            Registo: {new Date(user.createdAt).toLocaleDateString('pt-AO')}
                          </span>
                        </div>
                      </div>

                      {/* Balance adjusters */}
                      <div className="w-full xl:w-1/3 grid grid-cols-2 gap-3.5 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                        <div>
                          <p className="text-[10px] text-emerald-400 font-medium font-mono uppercase">Saldo Real Live (AOA)</p>
                          <p className="font-mono text-xs font-bold text-slate-300 mt-1">
                            {formatKz(user.balance)}
                          </p>
                          <div className="flex gap-1 mt-2">
                            <input
                              id={`inject-live-${user.id}`}
                              type="number"
                              placeholder="Kz..."
                              value={cashInjectAmount[liveWeight] || ''}
                              onChange={(e) => setCashInjectAmount(prev => ({ ...prev, [liveWeight]: e.target.value }))}
                              className="bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-white px-2 py-1 w-20 focus:outline-none"
                            />
                            <button
                              id={`apply-live-${user.id}`}
                              onClick={() => handleCashInject(user.id, false)}
                              className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded"
                            >
                              Set
                            </button>
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] text-amber-400 font-medium font-mono uppercase">Saldo Demo (AOA)</p>
                          <p className="font-mono text-xs font-bold text-slate-300 mt-1">
                            {formatKz(user.demoBalance)}
                          </p>
                          <div className="flex gap-1 mt-2">
                            <input
                              id={`inject-demo-${user.id}`}
                              type="number"
                              placeholder="Kz..."
                              value={cashInjectAmount[demoWeight] || ''}
                              onChange={(e) => setCashInjectAmount(prev => ({ ...prev, [demoWeight]: e.target.value }))}
                              className="bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-white px-2 py-1 w-20 focus:outline-none"
                            />
                            <button
                              id={`apply-demo-${user.id}`}
                              onClick={() => handleCashInject(user.id, true)}
                              className="text-[10px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2 py-1 rounded"
                            >
                              Set
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Probabilities settings panel (Ajustar lucros e perdas por probabilidade) */}
                      <div className="w-full xl:w-1/4">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                          Manipular Probabilidade Ganhos
                        </p>
                        <div className="grid grid-cols-4 gap-1">
                          {([10, 40, 60, 100] as const).map(prob => (
                            <button
                              key={prob}
                              id={`prob-${user.id}-${prob}`}
                              onClick={() => adminAdjustUserWinProbability(user.id, prob)}
                              className={`text-[11px] font-mono py-1.5 rounded transition-all font-bold ${
                                user.winProbability === prob
                                  ? 'bg-red-650 text-white shadow shadow-red-950 scale-105 border border-red-500'
                                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                              }`}
                            >
                              {prob}%
                            </button>
                          ))}
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1.5 leading-relaxed font-sans font-medium">
                          {user.winProbability === 10 ? '🔴 Perdas dominantes (Impossibilita alavancagem).' : 
                           user.winProbability === 40 ? '🟡 Payout orgânico (Dificuldade média controlada).' :
                           user.winProbability === 60 ? '🟢 Balanceado normal (Cotações de mercado reais).' :
                           '🔥 Vitória garantida 100% de probabilidade.'}
                        </p>
                      </div>

                      {/* Block Toggle action status */}
                      <div className="w-full xl:w-auto self-stretch xl:self-auto flex items-center justify-end border-t xl:border-t-0 border-slate-900 pt-3.5 xl:pt-0">
                        <button
                          id={`toggle-block-${user.id}`}
                          onClick={() => adminToggleUserBlock(user.id)}
                          className={`text-xs px-3.5 py-2 rounded-xl transition-all border flex items-center gap-1.5 font-semibold ${
                            user.isBlocked
                              ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-emerald-500 hover:text-white'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-red-500 hover:text-red-500'
                          }`}
                        >
                          <Ban size={14} />
                          {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </div>

                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* SUB-SECTION 2: TRANSFER PROCESSING QUEUE */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            
            {/* 1. Pending table */}
            <div>
              <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-tight mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                Aprovações Pendentes ({pendingTx.length})
              </h3>

              {pendingTx.length === 0 ? (
                <div className="border border-slate-850 bg-slate-950/20 rounded-2xl p-8 text-center text-xs text-slate-500">
                  Nenhuma transação pendente aguardando processamento bancário.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTx.map(tx => {
                    const isDep = tx.type === 'DEPOSIT';
                    return (
                      <div key={tx.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isDep ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                              {isDep ? 'DEPÓSITO' : 'LEVANTAMENTO'}
                            </span>
                            <span className="text-white text-xs font-bold">{tx.userName}</span>
                            <span className="text-[10px] font-mono text-slate-500">({tx.userEmail})</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-3 text-[10px] font-mono text-slate-400">
                            <p>Iban/Número: <span className="text-white font-medium">{tx.ibanOrPhone}</span></p>
                            <p>Método: <span className="text-white font-medium">{tx.paymentMethod}</span></p>
                            <p>Data: <span className="text-slate-500">{new Date(tx.date).toLocaleString('pt-AO')}</span></p>
                            <p>Cód Ref: <span className="text-amber-500 font-bold">{tx.proofNumber || 'AOA-OUT'}</span></p>
                          </div>
                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3.5 border-t md:border-t-0 border-slate-900 pt-3 md:pt-0">
                          <span className={`font-mono text-base font-extrabold ${isDep ? 'text-emerald-500' : 'text-red-400'}`}>
                            {formatKz(tx.amount)}
                          </span>
                          
                          <div className="flex gap-2">
                            <button
                              id={`approve-tx-${tx.id}`}
                              onClick={() => adminApproveTransaction(tx.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg px-4 py-2 flex items-center gap-1 active:translate-y-0.5 transition-all"
                            >
                              <CheckCircle2 size={13} /> Aprovar
                            </button>
                            <button
                              id={`reject-tx-${tx.id}`}
                              onClick={() => adminRejectTransaction(tx.id)}
                              className="bg-transparent border border-red-550 hover:bg-red-500 hover:text-white text-red-400 font-bold text-xs rounded-lg px-3 py-2 flex items-center gap-1 active:translate-y-0.5 transition-all"
                            >
                              <XCircle size={13} /> Rejeitar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Completed Transaction Logs */}
            <div className="pt-4 space-y-4">
              <div>
                <h3 className="font-display font-extrabold text-sm text-slate-150 uppercase tracking-tight">
                  Livro de Registros Bancários e Movimentos ({completedTx.length})
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Consulte depósitos e levantamentos finalizados com datas, códigos e status de aprovação.</p>
              </div>

              {/* Ledger search and filter tools */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="relative w-full sm:w-85">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    id="tx-search-input"
                    type="text"
                    placeholder="Pesquisar por nome, email ou IBAN..."
                    value={txSearchQuery}
                    onChange={(e) => setTxSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-550 w-full focus:outline-none focus:border-amber-500"
                  />
                </div>
                
                <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Tipo:</span>
                  <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 font-mono">
                    {(['ALL', 'DEPOSIT', 'WITHDRAW'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setTxTypeFilter(type)}
                        className={`text-[10px] px-3.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                          txTypeFilter === type
                            ? 'bg-amber-500 text-slate-950 font-extrabold shadow shadow-amber-550/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {type === 'ALL' ? 'Todos' : type === 'DEPOSIT' ? 'Depósitos' : 'Levantamentos'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/10">
                <table className="w-full text-left border-collapse text-xs select-none">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-medium">
                      <th className="p-3.5">Detalhes do Investidor</th>
                      <th className="p-3.5">Origem / Destino</th>
                      <th className="p-3.5">Data de Operação</th>
                      <th className="p-3.5">Código / Canal</th>
                      <th className="p-3.5 text-right font-mono">Montante</th>
                      <th className="p-3.5 text-center">Status Final</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-400">
                    {(() => {
                      const filteredCompletedTx = completedTx.filter(tx => {
                        const q = txSearchQuery.toLowerCase();
                        const matchesSearch = tx.userName.toLowerCase().includes(q) || 
                                              tx.userEmail.toLowerCase().includes(q) ||
                                              (tx.ibanOrPhone && tx.ibanOrPhone.toLowerCase().includes(q)) ||
                                              (tx.proofNumber && tx.proofNumber.toLowerCase().includes(q));
                        
                        if (txTypeFilter === 'DEPOSIT') {
                          return matchesSearch && tx.type === 'DEPOSIT';
                        }
                        if (txTypeFilter === 'WITHDRAW') {
                          return matchesSearch && tx.type === 'WITHDRAW';
                        }
                        return matchesSearch;
                      });

                      if (filteredCompletedTx.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-500 text-xs font-sans">
                              Nenhum movimento bancário encontrado com os filtros selecionados.
                            </td>
                          </tr>
                        );
                      }

                      return filteredCompletedTx.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-800/10 font-mono transition-all">
                          <td className="p-3.5 font-sans">
                            <p className="font-bold text-white text-xs">{tx.userName}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{tx.userEmail}</p>
                          </td>
                          <td className="p-3.5">
                            <p className="font-semibold text-slate-300">{tx.ibanOrPhone || 'N/A'}</p>
                          </td>
                          <td className="p-3.5 text-slate-450 text-[11px]">
                            {new Date(tx.date).toLocaleString('pt-AO')}
                          </td>
                          <td className="p-3.5 text-left font-sans">
                            <p className="text-[10px] text-amber-500 font-mono font-bold uppercase">{tx.proofNumber || 'Multicaixa'}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5">{tx.paymentMethod}</p>
                          </td>
                          <td className={`p-3.5 text-right font-bold text-sm ${tx.type === 'DEPOSIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tx.type === 'DEPOSIT' ? '+' : '-'}{formatKz(tx.amount)}
                          </td>
                          <td className="p-3.5 text-center font-sans">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide ${
                              tx.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {tx.status === 'APPROVED' ? 'EFECTUADO' : 'RECUSADO'}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SUB-SECTION 3: MARKET CONTROL & ASSETS REGISTRATION */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            
            {/* Custom Logo Customizer */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-805/85 space-y-4 animate-fade-in">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5 uppercase">
                <Sliders size={15} className="text-amber-500" /> Personalização do Logotipo da Corretora
              </h4>
              <p className="text-xs text-slate-400">
                Configure a identidade visual exibida no cabeçalho (topo) de toda a plataforma de forma síncrona.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                {/* Logo Text option */}
                <div>
                  <label htmlFor="admin-logo-text" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                    Nome da Marca / Texto do Logotipo
                  </label>
                  <input
                    id="admin-logo-text"
                    type="text"
                    value={platformConfig.logoText || ''}
                    onChange={(e) => adminConfigurePlatformSetting({ logoText: e.target.value })}
                    placeholder="Ex: KzOption"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Caractere ou nome exibido caso não indique um link de imagem de logotipo abaixo.</p>
                </div>

                {/* Logo Image URL Option */}
                <div>
                  <label htmlFor="admin-logo-url" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                    URL ou Link da Imagem do Logotipo (PNG / SVG recomendado)
                  </label>
                  <input
                    id="admin-logo-url"
                    type="text"
                    value={platformConfig.logoUrl || ''}
                    onChange={(e) => adminConfigurePlatformSetting({ logoUrl: e.target.value })}
                    placeholder="Cole aqui o link da imagem (ex: https://site.com/logo.png)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Insira a URL de uma imagem hospedada para substituir o logotipo textual padrão por completo.</p>
                </div>
              </div>
            </div>

            {/* Custom API Integrations Configurator */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 space-y-4 animate-fade-in text-left">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5 uppercase">
                <Settings size={15} className="text-amber-500" /> Integração de API da Corretora
              </h4>
              <p className="text-xs text-slate-400">
                Configure as chaves e os parâmetros de segurança para sincronizar transações instantâneas e notificações de pagamentos de rede.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                {/* API Key */}
                <div>
                  <label htmlFor="admin-api-key" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                    Chave Secreta da API (API Key)
                  </label>
                  <input
                    id="admin-api-key"
                    type="password"
                    value={platformConfig.apiKey || ''}
                    onChange={(e) => adminConfigurePlatformSetting({ apiKey: e.target.value })}
                    placeholder="Insira a sua API Key de integração"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Chave privada secreta para autenticar as chamadas entre o gateway e a corretora.</p>
                </div>

                {/* Webhook URL */}
                <div>
                  <label htmlFor="admin-webhook-url" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                    URL de Retorno (Webhook URL)
                  </label>
                  <input
                    id="admin-webhook-url"
                    type="text"
                    value={platformConfig.webhookUrl || ''}
                    onChange={(e) => adminConfigurePlatformSetting({ webhookUrl: e.target.value })}
                    placeholder="https://suacorretora.com/api/v1/webhook"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">URL HTTP POST destino para reportar eventos e liquidações automáticas de saques.</p>
                </div>
              </div>
            </div>

            {/* Global parameters adjust */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-805/85 space-y-4">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5 uppercase">
                <Sliders size={15} className="text-amber-500" /> Regulação de Mercado Interno
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Switch market open status */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold block mb-2">Estado dos Mercados {platformConfig.logoText || "KzOption"}</p>
                  <div className="flex gap-2">
                    <button
                      id="market-open-btn"
                      onClick={() => adminConfigurePlatformSetting({ marketStatus: 'OPEN' })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        platformConfig.marketStatus === 'OPEN'
                          ? 'bg-emerald-600 text-white shadow shadow-emerald-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Aberto (Live)
                    </button>
                    <button
                      id="market-close-btn"
                      onClick={() => adminConfigurePlatformSetting({ marketStatus: 'CLOSED' })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        platformConfig.marketStatus === 'CLOSED'
                          ? 'bg-red-600 text-white shadow shadow-red-950'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Fechado (Pausa)
                    </button>
                  </div>
                </div>

                {/* Volatility adjusts */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold block mb-2">Volatilidade dos Preços (Oscilações)</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'Baixa', val: 0.5 },
                      { label: 'Normal', val: 1.0 },
                      { label: 'Alta Express', val: 2.2 }
                    ].map(item => (
                      <button
                        key={item.val}
                        id={`volatility-${item.label}`}
                        onClick={() => adminConfigurePlatformSetting({ marketVolatilityMultiplier: item.val })}
                        className={`py-2 rounded-lg text-xs font-semibold font-medium transition-all ${
                          platformConfig.marketVolatilityMultiplier === item.val
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Limit and Payout adjusts */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-slate-805/85 space-y-4 animate-fade-in">
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5 uppercase">
                <Sliders size={15} className="text-amber-500" /> Parâmetros de Investimento & Payout
              </h4>
              <p className="text-xs text-slate-400">
                Ajuste os limites de investimento permitidos por contrato rápido e a margem de lucro pago ao cliente.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Min Trade Amount */}
                <div>
                  <label htmlFor="admin-min-trade" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                    Valor Mínimo por Contrato (KZ)
                  </label>
                  <input
                    id="admin-min-trade"
                    type="number"
                    step="100"
                    value={platformConfig.minTradeAmount ?? 1000}
                    onChange={(e) => adminConfigurePlatformSetting({ minTradeAmount: Math.max(1, parseInt(e.target.value) || 0) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Configuração inicial: 1.000 Kz</p>
                </div>

                {/* Max Trade Amount */}
                <div>
                  <label htmlFor="admin-max-trade" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                    Valor Máximo por Contrato (KZ)
                  </label>
                  <input
                    id="admin-max-trade"
                    type="number"
                    step="500"
                    value={platformConfig.maxTradeAmount ?? 10000}
                    onChange={(e) => adminConfigurePlatformSetting({ maxTradeAmount: Math.max(1, parseInt(e.target.value) || 0) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Configuração limite: 10.000 Kz</p>
                </div>

                {/* Win Payout Percentage */}
                <div>
                  <label htmlFor="admin-payout-pct" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                    Percentagem de Lucro (%)
                  </label>
                  <input
                    id="admin-payout-pct"
                    type="number"
                    min="1"
                    max="1000"
                    value={platformConfig.winPayoutPercentage ?? 80}
                    onChange={(e) => adminConfigurePlatformSetting({ winPayoutPercentage: Math.max(1, parseInt(e.target.value) || 0) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Exemplo: com 80%, um trade de 1000 Kz ganha 1800 Kz de payout.</p>
                </div>

                {/* Broker Spread / Commission Rate (%) */}
                <div>
                  <label htmlFor="admin-broker-spread" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                    Comissão / Spread do Adm (%)
                  </label>
                  <input
                    id="admin-broker-spread"
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={platformConfig.brokerSpreadPercentage ?? 5}
                    onChange={(e) => adminConfigurePlatformSetting({ brokerSpreadPercentage: Math.max(0, parseFloat(e.target.value) || 0) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-rose-500 font-extrabold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">O ADM ganha esta taxa sobre o volume operado de cada compra/venda, além de 100% dos palpites perdidos.</p>
                </div>
              </div>
            </div>

            {/* Create Asset form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Create Asset */}
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850/80 lg:col-span-1">
                <h4 className="font-display font-bold text-sm text-white mb-4 flex items-center gap-1.5 uppercase">
                  <Plus size={15} className="text-amber-500" /> Cadastrar Novo Criptoativo
                </h4>

                <form onSubmit={handleCreateAssetSubmit} className="space-y-4">
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block mb-1">Símbolo (Sigla)</label>
                    <input
                      id="create-asset-symbol"
                      type="text"
                      placeholder="Ex: ADA"
                      value={newAssetSymbol}
                      onChange={(e) => setNewAssetSymbol(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white uppercase focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block mb-1">Nome Completo</label>
                    <input
                      id="create-asset-name"
                      type="text"
                      placeholder="Cardano Protocol..."
                      value={newAssetName}
                      onChange={(e) => setNewAssetName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block mb-1">Categoria de Ativo</label>
                    <select
                      id="create-asset-category"
                      value={newAssetCategory}
                      onChange={(e) => setNewAssetCategory(e.target.value as AssetCategory)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="currencies">Moedas Principais (BTC/ETH)</option>
                      <option value="others">Altcoins & Tokens Secundários</option>
                      <option value="shares">Ações Globais Sintéticas</option>
                      <option value="oil">Energias & Petróleos Globais</option>
                      <option value="food">Commodities Agrícolas Globais</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block mb-1">Preço Inicial (Kz)</label>
                    <input
                      id="create-asset-price"
                      type="number"
                      value={newAssetPrice}
                      onChange={(e) => setNewAssetPrice(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block mb-1">Breve Descrição</label>
                    <textarea
                      id="create-asset-desc"
                      placeholder="Indústria nacional vocacionada ao abastecimento público..."
                      rows={2}
                      value={newAssetDesc}
                      onChange={(e) => setNewAssetDesc(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                  
                  <button
                    id="submit-create-asset-btn"
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus size={13} /> Cadastrar Ativo
                  </button>
                </form>
              </div>

              {/* Right Column: Manage Registered Assets & Manual Price Override */}
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850/80 lg:col-span-2 space-y-4">
                <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5 uppercase">
                  <Coins size={15} className="text-amber-500" /> Controlar Ativos & Bumps de Preço Manuais
                </h4>
                
                <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
                  {assets.map(asset => (
                    <div key={asset.id} className="bg-slate-900 border border-slate-800/60 p-3.5 rounded-xl flex items-center justify-between gap-4">
                      <div className="truncate w-1/3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-white tracking-wider">{asset.symbol}</span>
                          <span className="text-[9px] uppercase bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">
                            CRYPTO
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-1">{asset.name}</p>
                      </div>

                      <div className="w-1/4 text-center font-mono">
                        <p className="text-[10px] text-slate-500 uppercase">Preço Atual</p>
                        <p className="text-xs font-bold text-slate-300 mt-1">{formatKz(asset.price)}</p>
                      </div>

                      {/* Manual price controls (Ajustar ganhos e perdas dos usuários; Controlar o mercado interno da plataforma) */}
                      <div className="flex items-center gap-2 w-1/3 justify-end">
                        <input
                          id={`manual-price-input-${asset.id}`}
                          type="number"
                          placeholder="Kwanza..."
                          value={manualPrices[asset.id] || ''}
                          onChange={(e) => setManualPrices(prev => ({ ...prev, [asset.id]: parseFloat(e.target.value) || 0 }))}
                          className="bg-slate-950 border border-slate-800 rounded font-mono text-[10px] text-white px-2 py-1.5 w-20 focus:outline-none"
                        />
                        <button
                          id={`apply-manual-price-${asset.id}`}
                          onClick={() => handlePriceManualAdjust(asset.id)}
                          className="text-[10px] bg-red-600 font-bold px-2 py-1.5 text-white hover:bg-red-500 rounded transition-all"
                          title="Forçar Alteração do Preço no Mercado"
                        >
                          OverRide
                        </button>
                        <button
                          id={`delete-asset-${asset.id}`}
                          onClick={() => adminDeleteAsset(asset.id)}
                          className="text-[10px] p-1.5 hover:bg-red-500/10 hover:border-red-500/30 border border-slate-800 text-red-400 rounded transition-all"
                          title="Excluir Ativo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SUB-SECTION 4: TRAFFIC AND USER SIMULATOR */}
        {activeTab === 'traffic' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase flex items-center gap-2">
                  <Activity size={16} className="text-emerald-450 animate-pulse" />
                  Central de Monitorização de Tráfego e Simulador de Bots
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gerencie a presença artificial visível dos clientes e simule fluxos autônomos de transações para aumentar o engajamento orgânico.
                </p>
              </div>
              <span className="text-[10px] bg-slate-950 border border-slate-800 text-emerald-400 font-mono px-3 py-1 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Presença Ativa: {onlineUsersCount} Investidores
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column: Online Counter Controller */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-850/80 lg:col-span-1 flex flex-col justify-between">
                <div className="space-y-5">
                  <h4 className="font-display font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Users size={14} className="text-emerald-500" /> Regulador de Presença Online
                  </h4>

                  {/* Active Digital Meter */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-2 relative overflow-hidden">
                    <div className="absolute top-1 right-1">
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                        Live Pulse
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Leitura Atual no Painel do Usuário</p>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-5xl font-mono font-extrabold text-emerald-400 tracking-tight">{onlineUsersCount}</span>
                      <span className="text-xs text-slate-550 font-bold uppercase">Pessoas</span>
                    </div>
                    <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                      Flutuando sincronizadamente em tempo real para representar canais ativos e flutuações de tráfego.
                    </p>
                  </div>

                  {/* Interactive configuration inputs */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="online-target-input" className="text-[10px] text-slate-500 uppercase font-semibold block mb-2">
                        Alvo Médio de Online (Definio pelo ADM)
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="online-target-slider"
                          type="range"
                          min="3"
                          max="800"
                          value={platformConfig.onlineUsersTarget ?? 50}
                          onChange={(e) => adminConfigurePlatformSetting({ onlineUsersTarget: parseInt(e.target.value) || 3 })}
                          className="flex-1 accent-amber-500 h-1.5 my-auto bg-slate-900 rounded-lg cursor-pointer"
                        />
                        <input
                          id="online-target-input"
                          type="number"
                          min="3"
                          max="2000"
                          value={platformConfig.onlineUsersTarget ?? 50}
                          onChange={(e) => adminConfigurePlatformSetting({ onlineUsersTarget: Math.max(3, parseInt(e.target.value) || 3) })}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 w-20 text-center text-xs font-mono font-bold text-amber-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 bg-slate-900/50 p-3.5 rounded-xl border border-slate-850/60 leading-relaxed font-sans font-medium space-y-1.5">
                      <p className="font-semibold text-slate-450 flex items-center gap-1">
                        ℹ️ Comportamento de Flutuação:
                      </p>
                      <p>
                        Se o ADM configurar <strong className="text-white font-semibold">{(platformConfig.onlineUsersTarget ?? 50)}</strong> pessoas online, o sistema alternará dinamicamente entre <strong className="text-emerald-400 font-semibold">{Math.max(3, Math.round((platformConfig.onlineUsersTarget ?? 50) * 0.78))}</strong> e <strong className="text-emerald-400 font-semibold">{Math.round((platformConfig.onlineUsersTarget ?? 50) * 1.12)}</strong> usuários de forma consecutiva nos painéis dos clientes, simulando picos e vales orgânicos.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-900 pt-4 mt-6">
                  <p className="text-[9px] text-slate-650 font-mono text-center">
                    Simulador KzOption v2.4 • Base em Luanda GMT+1
                  </p>
                </div>
              </div>

              {/* Right Column: Live Simulated Logs Stream */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-850/80 lg:col-span-2 space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-medium text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Activity size={14} className="text-amber-500" /> Fluxo em Tempo Real de Operações & Registros
                    </h4>
                    
                    <button
                      id="force-event-btn"
                      onClick={() => {
                        const angolanNames = [
                          'Lucas Neto', 'Sílvia Costa', 'Amílcar Baptista', 'Claudio Santos', 'Mariana Jorge',
                          'Pedro Cabral', 'Eunice Ventura', 'Gerson Silva', 'Helder Manuel', 'Janice Cruz',
                          'Valter Cardoso', 'Catarina Diogo', 'Domingos Antunes', 'Isabel Ndala', 'António Benguela'
                        ];
                        const angolanProvinces = [
                          'Luanda', 'Benguela', 'Cabinda', 'Huambo', 'Huíla', 'Namibe', 'Uíge', 'Malanje', 'Cuanza Sul'
                        ];
                        const activities = [
                          { action: 'abriu contrato de VENDA no ETH/AOA', type: 'trade_loss', amount: 8000 },
                          { action: 'abriu contrato de COMPRA no BTC/AOA', type: 'trade_win', amount: 12000 },
                          { action: 'solicitou levantamento bancário para conta BFA', type: 'withdrawal', amount: 25000 },
                          { action: 'depositou fundos via transferência instantânea', type: 'deposit', amount: 50000 },
                          { action: 'concluiu contrato com lucro de +180%', type: 'trade_win', amount: 20000 },
                          { action: 'assinou termo de conformidade digital', type: 'verification' },
                          { action: 'fez login via dispositivo móvel Unitel', type: 'verification' }
                        ];

                        const randomName = angolanNames[Math.floor(Math.random() * angolanNames.length)];
                        const randomProvince = angolanProvinces[Math.floor(Math.random() * angolanProvinces.length)];
                        const randomAct = activities[Math.floor(Math.random() * activities.length)];

                        const newLog = {
                          id: `activity-manual-${Date.now()}`,
                          name: randomName,
                          location: randomProvince,
                          action: randomAct.action,
                          type: randomAct.type,
                          amount: randomAct.amount,
                          time: 'Agora mesmo'
                        };

                        setLiveLog(prev => [newLog, ...prev.slice(0, 14)]);
                      }}
                      className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                    >
                      <Plus size={11} /> Forçar Atividade
                    </button>
                  </div>

                  {/* Logs list output */}
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {liveLog.map(log => {
                      const isWin = log.type === 'trade_win';
                      const isLoss = log.type === 'trade_loss';
                      const isDep = log.type === 'deposit';
                      const isWith = log.type === 'withdrawal';
                      
                      return (
                        <div key={log.id} className="bg-slate-900 border border-slate-800/50 p-3 rounded-lg flex items-center justify-between gap-4 font-mono text-[11px] hover:border-slate-800 transition-all">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${
                              isWin ? 'bg-emerald-550' :
                              isLoss ? 'bg-red-500' :
                              isDep ? 'bg-cyan-500' :
                              isWith ? 'bg-amber-500' :
                              'bg-slate-500'
                            }`} />
                            
                            <div>
                              <p className="text-slate-300 font-bold font-sans text-left">
                                {log.name} <span className="text-[10px] text-slate-500 font-medium">({log.location})</span>
                              </p>
                              <p className="text-slate-400 text-[10px] mt-0.5 text-left">{log.action}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            {log.amount && (
                              <p className={`font-bold ${
                                isWin || isDep ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {formatKz(log.amount)}
                              </p>
                            )}
                            <p className="text-[9px] text-slate-500 mt-0.5">{log.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-xs text-slate-550 pt-2 border-t border-slate-900 text-center font-sans">
                  A atividade simulada gera de forma assíncrona novos eventos a cada poucos segundos.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUB-SECTION 4: COMPLIANCE REVIEW CONSOLE */}
        {activeTab === 'compliance' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase">Consola de Verificação de Identidades & Contratos</h3>
                <p className="text-xs text-slate-400 mt-1">Audite as submissões de BI, autorretratos e consentimentos digitais outorgados voluntariamente pelos investidores angolanos.</p>
              </div>
              <span className="text-[10px] bg-slate-950 border border-slate-800 text-amber-500 font-mono px-3 py-1 rounded">
                Pendentes: {users.filter(u => u.verificationStatus === 'PENDING').length}
              </span>
            </div>

            {users.filter(u => u.verificationStatus !== 'NOT_SUBMITTED').length === 0 ? (
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 space-y-3">
                <Fingerprint size={48} className="mx-auto text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">Nenhuma submissão de conformidade registada</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">Os investidores poderão ver as opções de verificação de identidade e submissão na secção "Editar Perfil" no topo.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {users.filter(u => u.verificationStatus !== 'NOT_SUBMITTED').map(user => {
                  const data = user.verificationData;
                  return (
                    <div 
                      key={user.id} 
                      className="bg-slate-950/60 border border-slate-850 rounded-2xl p-6 space-y-6 hover:border-slate-800 transition-all shadow-lg text-left"
                    >
                      {/* Dossier Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-900/80">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-sm font-bold text-white">{user.name}</h4>
                            <span className="text-[10px] font-mono text-slate-500">ID: {user.id}</span>
                          </div>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">Estado Cadastral:</span>
                          {user.verificationStatus === 'PENDING' && (
                            <span className="bg-amber-500/10 text-amber-400 text-[11px] px-2.5 py-1 rounded-full font-semibold border border-amber-500/20 animate-pulse">
                              Aguardando Auditoria
                            </span>
                          )}
                          {user.verificationStatus === 'APPROVED' && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[11px] px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
                              Aprovado / Certificado
                            </span>
                          )}
                          {user.verificationStatus === 'REJECTED' && (
                            <span className="bg-red-500/10 text-red-500 text-[11px] px-2.5 py-1 rounded-full font-semibold border border-red-500/20">
                              Rejeitado / Pendente Correção
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dossier Content */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* Column 1: Personal Profile Data */}
                        <div className="space-y-4">
                          <h5 className="text-[11px] font-mono uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-900 pb-1">
                            <FileText size={12} className="text-amber-500" /> Dados do Formulário
                          </h5>
                          <div className="space-y-3 text-xs">
                            <div>
                              <span className="text-slate-500 block text-[10px] font-mono">Nome do BI:</span>
                              <span className="text-slate-200 font-semibold">{data?.firstName || user.name.split(' ')[0]} {data?.lastName || ''}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] font-mono">Data de Nascimento:</span>
                              <span className="text-slate-200 font-semibold">{data?.birthDate || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] font-mono">Contacto Telefónico:</span>
                              <span className="text-slate-200 font-semibold">{data?.contactNumber || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] font-mono">Localização (Angola):</span>
                              <span className="text-slate-200 font-semibold">{data?.location || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[10px] font-mono">Data do Envio:</span>
                              <span className="text-slate-200 font-mono text-[11px]">{data?.submittedAt ? new Date(data.submittedAt).toLocaleString() : 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Uploaded BI/Selfie proofs */}
                        <div className="md:col-span-2 space-y-4">
                          <h5 className="text-[11px] font-mono uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-900 pb-1">
                            <ShieldCheck size={12} className="text-amber-500" /> Ficheiros & Comprovativos Enviados
                          </h5>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Frente BI */}
                            <div className="bg-slate-900 border border-slate-850 p-2 rounded-xl flex flex-col justify-between items-center h-44 text-center">
                              <span className="text-[10px] text-slate-500 font-mono uppercase pb-1">Frente do BI</span>
                              {data?.biFrontUrl ? (
                                <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded bg-slate-950 p-1 relative cursor-pointer">
                                  <img src={data.biFrontUrl} alt="Frente do BI" className="max-h-28 max-w-full object-contain hover:scale-110 transition-all" />
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-600 my-auto">Não providenciado</p>
                              )}
                            </div>

                            {/* Verso BI */}
                            <div className="bg-slate-900 border border-slate-850 p-2 rounded-xl flex flex-col justify-between items-center h-44 text-center">
                              <span className="text-[10px] text-slate-500 font-mono uppercase pb-1">Verso do BI</span>
                              {data?.biBackUrl ? (
                                <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded bg-slate-950 p-1 relative cursor-pointer">
                                  <img src={data.biBackUrl} alt="Verso do BI" className="max-h-28 max-w-full object-contain hover:scale-110 transition-all" />
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-600 my-auto">Não providenciado</p>
                              )}
                            </div>

                            {/* Selfie Com BI */}
                            <div className="bg-slate-900 border border-slate-850 p-2 rounded-xl flex flex-col justify-between items-center h-44 text-center">
                              <span className="text-[10px] text-slate-500 font-mono uppercase pb-1">Selfie + BI</span>
                              {data?.selfieWithBiUrl ? (
                                <div className="flex-1 w-full flex items-center justify-center overflow-hidden rounded bg-slate-950 p-1 relative cursor-pointer">
                                  <img src={data.selfieWithBiUrl} alt="Selfie com BI" className="max-h-28 max-w-full object-contain hover:scale-110 transition-all" />
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-600 my-auto">Não providenciado</p>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Signature & Consent verification block */}
                      <div className="border-t border-slate-900/80 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/25 p-4 rounded-xl border border-slate-850/65">
                        <div className="space-y-1 text-left">
                          <p className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Users size={14} className="text-amber-500" /> Autenticidade Contratual de Consentimento
                          </p>
                          <p className="text-[10px] text-slate-500 max-w-md">O investidor outorgou digitalmente os termos operacionais KzOption autorizando a salvaguarda cadastral sob os canais de Luanda.</p>
                        </div>

                        {data?.signatureDataUrl ? (
                          <div className="flex items-center gap-4 bg-slate-950 border border-slate-850 px-4 py-2 rounded-xl w-full sm:w-auto justify-between">
                            <span className="text-[10px] text-emerald-400 font-mono">✍️ ASSINADO NO CONTRATO:</span>
                            <div className="h-8 w-24 bg-slate-200 rounded p-0.5 flex items-center justify-center">
                              <img src={data.signatureDataUrl} alt="Assinatura" className="max-h-full max-w-full object-contain invert" />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-red-500 font-mono bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-900/20">Sem Assinatura registada</span>
                        )}
                      </div>

                      {/* Decision buttons (only actionable if status === 'PENDING' or for adjustment overrides) */}
                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          id={`reject-verif-${user.id}`}
                          onClick={() => adminRejectVerification(user.id)}
                          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all ${
                            user.verificationStatus === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20 cursor-default'
                              : 'bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-500 hover:text-white'
                          }`}
                          disabled={user.verificationStatus === 'REJECTED'}
                        >
                          {user.verificationStatus === 'REJECTED' ? 'Rejeitado / Pendente Correção' : 'Rejeitar / Solicitar Correção'}
                        </button>
                        <button
                          id={`approve-verif-${user.id}`}
                          onClick={() => adminApproveVerification(user.id)}
                          className={`text-xs px-5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                            user.verificationStatus === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-500/10'
                          }`}
                          disabled={user.verificationStatus === 'APPROVED'}
                        >
                          <ShieldCheck size={14} />
                          {user.verificationStatus === 'APPROVED' ? 'Identidade Certificada (Aprovada)' : 'Aprovar e Certificar Investidor'}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUB-SECTION 7: CORE SYSTEM structural CONFIGURATIONS */}
        {activeTab === 'system' && (
          <div className="space-y-6 animate-fade-in text-left">
            
            {/* Header Area */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
              <h3 className="font-display font-black text-lg text-white flex items-center gap-2 uppercase tracking-wide">
                <Sliders className="text-amber-500" size={20} />
                Configurações Estruturais do Sistema
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gira a identidade visual, modo de segurança, comunidade oficial e as variáveis principais da plataforma de trading.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
              
              {/* BRANDING PANEL */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-5">
                <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  🎨 Identidade Visual & Nome do Sistema
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="sys-name" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                      Nome da Plataforma (Ex: KzOption, AngolaTrade)
                    </label>
                    <input
                      id="sys-name"
                      type="text"
                      value={platformConfig.logoText || ''}
                      onChange={(e) => adminConfigurePlatformSetting({ logoText: e.target.value })}
                      placeholder="Indique o nome principal"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Este nome é utilizado em mensagens de e-mail, termos contratuais e rodapés.</p>
                  </div>

                  <div>
                    <label htmlFor="sys-logo" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                      Link da Imagem do Logotipo (Opcional)
                    </label>
                    <input
                      id="sys-logo"
                      type="text"
                      value={platformConfig.logoUrl || ''}
                      onChange={(e) => adminConfigurePlatformSetting({ logoUrl: e.target.value })}
                      placeholder="https://exemplo.com/imagens/logo.png"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Insira uma URL direta para usar uma imagem personalizada em vez do logotipo de texto.</p>
                  </div>

                  {/* Built-in Style Presets */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-2">Visualização Prévia do Logo</span>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-center min-h-[60px]">
                      {platformConfig.logoUrl ? (
                        <img src={platformConfig.logoUrl} alt="Logo Preview" className="max-h-10 max-w-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-display font-black text-lg flex items-center justify-center shadow shadow-amber-500/20">
                            {(platformConfig.logoText || "K").substring(0, 1).toUpperCase()}
                          </div>
                          <span className="font-display font-black text-md text-white">
                            {platformConfig.logoText || "KzOption"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* MAINTENANCE & SECURITY PANEL */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-5">
                <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  🔒 Modo de Manutenção & Estado
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-white block">Estado de Manutenção do Sistema</span>
                      <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                        Ative isto para suspender temporariamente as operações de trading e mostrar uma página de manutenção para clientes normais.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => adminConfigurePlatformSetting({ maintenanceMode: !platformConfig.maintenanceMode })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        platformConfig.maintenanceMode ? 'bg-rose-500' : 'bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          platformConfig.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {platformConfig.maintenanceMode ? (
                    <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[10px]">
                        <Activity size={12} className="animate-pulse" /> Modo de Manutenção Ativado
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Neste momento, todos os investidores e convidados verão a tela de bloqueio oficial informando que o sistema está em manutenção estrutural.
                      </p>
                      <p className="text-amber-400 font-bold leading-relaxed text-[10px]">
                        Atenção: A sua sessão de administrador continuará desbloqueada para que possa reverter esta opção a qualquer momento.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 text-xs space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
                        ✓ Sistema Operando Normalmente (Online)
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        A plataforma está operável e todos os formulários de registo, logins, depósitos e ordens de trading estão online para Angola.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* COMMUNITY & LINKS PANEL */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-5">
                <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  📢 Comunidade Oficial & Suporte Unitel
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="sys-comm" className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
                      Link Telegram / WhatsApp da Comunidade
                    </label>
                    <input
                      id="sys-comm"
                      type="text"
                      value={platformConfig.communityLink || ''}
                      onChange={(e) => adminConfigurePlatformSetting({ communityLink: e.target.value })}
                      placeholder="https://t.me/comunidade_kzoption"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Será exibido nas telas de manutenção e em abas de ajuda para unir os investidores.</p>
                  </div>
                </div>
              </div>

              {/* OPERATIONAL PARAMETERS SHORTCUTS PANEL */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-5">
                <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  💰 Limites Operacionais & Margens Kz
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lim-min-dep" className="text-[9px] text-slate-500 uppercase font-bold block mb-1.5">Depósito Mínimo (AOA)</label>
                    <input
                      id="lim-min-dep"
                      type="number"
                      value={platformConfig.minimumDeposit || 1000}
                      onChange={(e) => adminConfigurePlatformSetting({ minimumDeposit: parseInt(e.target.value) || 1000 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="lim-min-withdraw" className="text-[9px] text-slate-500 uppercase font-bold block mb-1.5">Levantamento Mínimo (AOA)</label>
                    <input
                      id="lim-min-withdraw"
                      type="number"
                      value={platformConfig.minimumWithdrawal || 1000}
                      onChange={(e) => adminConfigurePlatformSetting({ minimumWithdrawal: parseInt(e.target.value) || 1000 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="lim-min-trade" className="text-[9px] text-slate-500 uppercase font-bold block mb-1.5">Contrato Mínimo (AOA)</label>
                    <input
                      id="lim-min-trade"
                      type="number"
                      value={platformConfig.minTradeAmount || 1000}
                      onChange={(e) => adminConfigurePlatformSetting({ minTradeAmount: parseInt(e.target.value) || 1000 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="lim-payout" className="text-[9px] text-slate-500 uppercase font-bold block mb-1.5">Payout % Binário</label>
                    <input
                      id="lim-payout"
                      type="number"
                      value={platformConfig.winPayoutPercentage || 80}
                      onChange={(e) => adminConfigurePlatformSetting({ winPayoutPercentage: parseInt(e.target.value) || 80 })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 px-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SUB-SECTION 8: Landing CMS Configuration */}
        {activeTab === 'cms' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-display font-black text-lg text-white flex items-center gap-2 uppercase tracking-wide">
                  <FileText className="text-amber-500" size={20} />
                  Área CMS de Edição da Landing Page
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Personalize em tempo real todas as informações visuais, estatísticas, textos, perguntas frequentes e avisos do site principal da plataforma.
                </p>
              </div>
              <button
                onClick={handleSaveCMS}
                className="bg-emerald-500 hover:bg-emerald-400 active:translate-y-0.5 text-slate-950 font-display font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                {cmsSaveSuccess ? <CheckCircle2 size={14} className="text-slate-950" /> : <RefreshCw size={14} className="text-slate-950" />}
                {cmsSaveSuccess ? 'Guardado com Sucesso!' : 'Guardar Alterações do Site'}
              </button>
            </div>

            {cmsSaveSuccess && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2.5 animate-bounce">
                <CheckCircle2 size={16} /> Corretamente sincronizado com o servidor. A página principal de todos os utilizadores já apresenta os novos conteúdos!
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
              
              {/* HERO SECTION DESIGN */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-4">
                <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  🚀 Secção Principal (Hero & Call to Actions)
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Badge de Novidade (Topo)</label>
                    <input
                      type="text"
                      value={cmsForm.heroBadge || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroBadge: e.target.value })}
                      placeholder="Ex: NOVO SUCESSO EM ANGOLA"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Título de Impacto (Display)</label>
                    <input
                      type="text"
                      value={cmsForm.heroTitle || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroTitle: e.target.value })}
                      placeholder="Ex: A Maior Plataforma de Negociação de Angola"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Subtítulo Explicativo</label>
                    <textarea
                      rows={3}
                      value={cmsForm.heroSubtitle || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, heroSubtitle: e.target.value })}
                      placeholder="Ex: Negoceie opções binárias e spot com payouts elevados em Kwanzas angolanos de forma rápida e segura."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Texto CTA Prática</label>
                      <input
                        type="text"
                        value={cmsForm.heroCta1 || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, heroCta1: e.target.value })}
                        placeholder="Ex: Experimentar Conta Demo Grátis"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Texto CTA Registo</label>
                      <input
                        type="text"
                        value={cmsForm.heroCta2 || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, heroCta2: e.target.value })}
                        placeholder="Ex: Começar com Depósito Baixo"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STATS COUNT GRID DESIGN */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-4">
                <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  📊 Indicadores de Volume & Confiança
                </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Estatística 1 - Título</label>
                      <input
                        type="text"
                        value={cmsForm.stat1Title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, stat1Title: e.target.value })}
                        placeholder="Ex: Volume Transacionado"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Estatística 1 - Valor</label>
                      <input
                        type="text"
                        value={cmsForm.stat1Value || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, stat1Value: e.target.value })}
                        placeholder="Ex: +50M Kz"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Estatística 2 - Título</label>
                      <input
                        type="text"
                        value={cmsForm.stat2Title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, stat2Title: e.target.value })}
                        placeholder="Ex: Investidores Ativos"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Estatística 2 - Valor</label>
                      <input
                        type="text"
                        value={cmsForm.stat2Value || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, stat2Value: e.target.value })}
                        placeholder="Ex: +12,400"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Estatística 3 - Título</label>
                      <input
                        type="text"
                        value={cmsForm.stat3Title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, stat3Title: e.target.value })}
                        placeholder="Ex: Tempo Médio de Levantamento"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Estatística 3 - Valor</label>
                      <input
                        type="text"
                        value={cmsForm.stat3Value || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, stat3Value: e.target.value })}
                        placeholder="Ex: 5 Minutos"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Estatística 4 - Título</label>
                      <input
                        type="text"
                        value={cmsForm.stat4Title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, stat4Title: e.target.value })}
                        placeholder="Ex: Suporte Local Unitel/Movicel"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Estatística 4 - Valor</label>
                      <input
                        type="text"
                        value={cmsForm.stat4Value || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, stat4Value: e.target.value })}
                        placeholder="Ex: 24h / 7d"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SIMULATOR HEADER DESIGN */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-4">
                <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  🎮 Área do Simulador em Tempo Real
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Badge de Chamada do Simulador</label>
                    <input
                      type="text"
                      value={cmsForm.simBadge || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, simBadge: e.target.value })}
                      placeholder="Ex: SIMULADOR DE PRÁTICA INTERATIVO"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Título do Simulador</label>
                    <input
                      type="text"
                      value={cmsForm.simTitle || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, simTitle: e.target.value })}
                      placeholder="Ex: Experimente Negocear Sem Qualquer Risco"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Subtítulo Informativo do Simulador</label>
                    <textarea
                      rows={2}
                      value={cmsForm.simSubtitle || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, simSubtitle: e.target.value })}
                      placeholder="Ex: Use o gráfico abaixo para testar as suas predições e entender o funcionamento imediato do mercado."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* BENEFITS DESIGN */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-4">
                <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  ⭐ Pilares de Vantagem Competitiva
                </h4>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Badge Lista</label>
                      <input
                        type="text"
                        value={cmsForm.benefitsBadge || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, benefitsBadge: e.target.value })}
                        placeholder="VANTAGENS PREMIUM"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Título Bloco</label>
                      <input
                        type="text"
                        value={cmsForm.benefitsTitle || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, benefitsTitle: e.target.value })}
                        placeholder="Porquê Escolher-nos"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Subtítulo Bloco Benefícios</label>
                    <input
                      type="text"
                      value={cmsForm.benefitsSubtitle || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, benefitsSubtitle: e.target.value })}
                      placeholder="A nossa infraestrutura foi desenhada especificamente para os traders de Angola."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="bg-slate-900/40 p-3 rounded-xl space-y-2.5 border border-slate-900">
                    <div>
                      <span className="text-[9px] text-amber-500 font-extrabold uppercase">Benefício 1</span>
                      <input
                        type="text"
                        value={cmsForm.benefit1Title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, benefit1Title: e.target.value })}
                        placeholder="Depósitos Rápidos & Integrados"
                        className="w-full bg-slate-905 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white mb-1"
                      />
                      <input
                        type="text"
                        value={cmsForm.benefit1Desc || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, benefit1Desc: e.target.value })}
                        placeholder="Deposite e levante via Multicaixa ou IBAN sem complicação."
                        className="w-full bg-slate-905 border border-slate-800 rounded-lg py-1 px-2 text-[11px] text-slate-400"
                      />
                    </div>

                    <div>
                      <span className="text-[9px] text-amber-500 font-extrabold uppercase">Benefício 2</span>
                      <input
                        type="text"
                        value={cmsForm.benefit2Title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, benefit2Title: e.target.value })}
                        placeholder="Execução Instantânea em Milissegundos"
                        className="w-full bg-slate-905 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white mb-1"
                      />
                      <input
                        type="text"
                        value={cmsForm.benefit2Desc || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, benefit2Desc: e.target.value })}
                        placeholder="Sem atrasos ou slippage de ordens, garantindo preços fiéis."
                        className="w-full bg-slate-905 border border-slate-800 rounded-lg py-1 px-2 text-[11px] text-slate-400"
                      />
                    </div>

                    <div>
                      <span className="text-[9px] text-amber-500 font-extrabold uppercase">Benefício 3</span>
                      <input
                        type="text"
                        value={cmsForm.benefit3Title || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, benefit3Title: e.target.value })}
                        placeholder="Suporte Multicanal em Português"
                        className="w-full bg-slate-905 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white mb-1"
                      />
                      <input
                        type="text"
                        value={cmsForm.benefit3Desc || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, benefit3Desc: e.target.value })}
                        placeholder="Atendimento via WhatsApp, Telegram ou Telefone 24/7."
                        className="w-full bg-slate-905 border border-slate-800 rounded-lg py-1 px-2 text-[11px] text-slate-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BANKS & FOOTERS DESIGN */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-4 lg:col-span-2">
                <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  🏢 Rodapé, Bancos & Avisos Legais de Risco
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Subtítulo de Parcerias Bancárias</label>
                    <input
                      type="text"
                      value={cmsForm.banksSubtitle || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, banksSubtitle: e.target.value })}
                      placeholder="Ex: Conectado com as maiores instituições reguladas em Angola para processar os seus levantamentos."
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">Aviso Crítico de Risco (Legal)</label>
                    <textarea
                      rows={2}
                      value={cmsForm.footerRiskWarning || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, footerRiskWarning: e.target.value })}
                      placeholder="Ex: Opções Digitais envolvem risco financeiro substancial..."
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl py-2 px-3 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* FAQ DESIGN */}
              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-4 lg:col-span-2">
                <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                  ❓ Perguntas Frequentes (FAQs) do Site
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-1.5">FAQ Central - Título Geral</label>
                    <input
                      type="text"
                      value={cmsForm.faqTitle || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, faqTitle: e.target.value })}
                      placeholder="Perguntas Frequentes"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white font-bold"
                    />
                    <label className="text-[9px] text-slate-500 block mt-2 mb-1">FAQ Central - Subtítulo Geral</label>
                    <input
                      type="text"
                      value={cmsForm.faqSubtitle || ''}
                      onChange={(e) => setCmsForm({ ...cmsForm, faqSubtitle: e.target.value })}
                      placeholder="Resolva as suas dúvidas de imediato"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-900 space-y-4 md:col-span-2">
                    <div>
                      <span className="text-[10px] text-amber-500 font-extrabold uppercase">Pergunta 1</span>
                      <input
                        type="text"
                        value={cmsForm.faq1Question || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, faq1Question: e.target.value })}
                        placeholder="Como posso depositar a partir de Angola?"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white mb-1"
                      />
                      <textarea
                        rows={2}
                        value={cmsForm.faq1Answer || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, faq1Answer: e.target.value })}
                        placeholder="Pode efetuar o pagamento via transferência no Multicaixa..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[11px] text-slate-400 resize-none font-sans"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-[10px] text-amber-500 font-extrabold uppercase">Pergunta 2</span>
                      <input
                        type="text"
                        value={cmsForm.faq2Question || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, faq2Question: e.target.value })}
                        placeholder="Qual é o montante mínimo para trading?"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white mb-1"
                      />
                      <textarea
                        rows={2}
                        value={cmsForm.faq2Answer || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, faq2Answer: e.target.value })}
                        placeholder="O valor mínimo de um contrato binário é de 1000 Kwanzas..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[11px] text-slate-400 resize-none font-sans"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-900">
                      <span className="text-[10px] text-amber-500 font-extrabold uppercase">Pergunta 3</span>
                      <input
                        type="text"
                        value={cmsForm.faq3Question || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, faq3Question: e.target.value })}
                        placeholder="É seguro enviar o BI para verificação?"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-xs text-white mb-1"
                      />
                      <textarea
                        rows={2}
                        value={cmsForm.faq3Answer || ''}
                        onChange={(e) => setCmsForm({ ...cmsForm, faq3Answer: e.target.value })}
                        placeholder="Sim. Todos os seus dados de identidade biométrica são encriptados e armazenados com segurança..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[11px] text-slate-400 resize-none font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SUB-SECTION 9: API CONFIG & EXCHANGE RATE PARITY */}
        {activeTab === 'api' && (
          <div className="space-y-6 animate-fade-in text-left pb-16">
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-display font-black text-lg text-white flex items-center gap-2 uppercase tracking-wide">
                  <Cpu className="text-amber-500" size={20} />
                  API CONFIG — Gestão Cambial & Conectividade
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Verifique e controle todas as fontes de cotações de preços (Binance API vs. Simulador) e paridade cambial do Kwanza (AOA/USD).
                </p>
              </div>
              <button
                onClick={handleSaveAPI}
                className="bg-emerald-500 hover:bg-emerald-400 active:translate-y-0.5 text-slate-950 font-display font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                {apiSaveSuccess ? <CheckCircle2 size={14} className="text-slate-950" /> : <RefreshCw size={14} className="text-slate-950" />}
                {apiSaveSuccess ? 'Configurações Guardadas!' : 'Guardar Alterações da API'}
              </button>
            </div>

            {apiSaveSuccess && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs flex items-center gap-2.5 animate-bounce">
                <CheckCircle2 size={16} /> Parâmetros cambiais e fontes de dados atualizados com sucesso no Firestore em tempo real!
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main settings box */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* CONFIG CARD 1: SOURCE & INTERFACE */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-5">
                  <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    🔌 Parametrização Cambial & Modos de Alimentação
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Source Selection */}
                    <div>
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1.5">Fonte de Alimentação de Preços</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setApiForm({ ...apiForm, apiPriceDataSource: 'BINANCE' })}
                          className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                            apiForm.apiPriceDataSource === 'BINANCE'
                              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="font-extrabold text-[10px]">BINANCE API</span>
                          <span className="text-[9px] text-slate-500 font-normal">Preços em Tempo Real</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setApiForm({ ...apiForm, apiPriceDataSource: 'SIMULATOR' })}
                          className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                            apiForm.apiPriceDataSource === 'SIMULATOR'
                              ? 'bg-amber-950/40 border-amber-500 text-amber-400'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="font-extrabold text-[10px]">SIMULADOR</span>
                          <span className="text-[9px] text-slate-500 font-normal">Modo Local Autónomo</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                        Selecione "BINANCE API" para operar líquido no mercado mundial ou "SIMULADOR" para contingência no caso de falhas de rede.
                      </p>
                    </div>

                    {/* USD-AOA Exchange Rate Input */}
                    <div>
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1.5">Taxa de Paridade Cambial (AOA / USD)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={apiForm.apiUsdToAoa || 920}
                          onChange={(e) => setApiForm({ ...apiForm, apiUsdToAoa: Number(e.target.value) })}
                          placeholder="920"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-3 pr-12 text-xs text-white focus:outline-none focus:border-amber-500 font-mono font-bold"
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">AOA / $</span>
                      </div>
                      <div className="bg-slate-900/30 border border-slate-800/50 p-2.5 rounded-lg mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">Exemplo prático:</span>
                        <span className="text-[10px] text-slate-300 font-semibold font-mono">
                          1 BTC ($65,000) = {formatKz(65000 * (apiForm.apiUsdToAoa ?? 920))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Interval Slider / Select */}
                    <div>
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1.5">Frequência de Atualização dos Preços (Binance)</label>
                      <select
                        value={apiForm.apiBinanceIntervalMs || 8500}
                        onChange={(e) => setApiForm({ ...apiForm, apiBinanceIntervalMs: Number(e.target.value) })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      >
                        <option value={4000}>4.0 Segundos (Ultra-Rápido)</option>
                        <option value={8500}>8.5 Segundos (Frequência Padrão)</option>
                        <option value={15000}>15.0 Segundos (Banda Moderada)</option>
                        <option value={30000}>30.0 Segundos (Económico)</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                        Frequências ultra-rápidas aumentam a dinâmica, mas requerem excelente estabilidade de rede nos clientes finais.
                      </p>
                    </div>

                    {/* Maintenance / Emergency Alert info */}
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/50 flex items-start gap-3">
                      <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wide block">Instrução de Segurança</span>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Em caso de manutenções ou instabilidade cambial nacional, altere a fonte para "SIMULADOR" para estabilizar o preço dos pares de moedas localmente e impedir furos no saldo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONFIG CARD 2: DISCLAIMER JUSTIFICATION SECTION */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-4">
                  <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    ✍️ Justificação Oficial do Sistema (Para canais de suporte / auditoria)
                  </h4>
                  <div>
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1.5">Mensagem / Disclaimer Administrativo da Paridade Cambial</label>
                    <textarea
                      rows={4}
                      value={apiForm.apiCustomJustification || ''}
                      onChange={(e) => setApiForm({ ...apiForm, apiCustomJustification: e.target.value })}
                      placeholder="Declaração para evitar conversas e provar conformidade jurídica do sistema..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-sans leading-relaxed text-slate-300"
                    />
                    <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                      Esta declaração formal de justificativa é armazenada de forma segura na nuvem e serve como prova de transparência e auditoria de cotações para evitar disputas ("evitar brincar com conversa").
                    </p>
                  </div>
                </div>

              </div>

              {/* Sidebar connection state monitor and diagnostics */}
              <div className="space-y-6">
                
                {/* CONNECTIONS STATUS CARD */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-5">
                  <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    📡 Monitorização e Status Real-Time
                  </h4>

                  <div className="space-y-4">
                    {/* Glowing status display */}
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/60 flex items-center gap-3">
                      <div className="relative">
                        <span className={`flex h-3 w-3 rounded-full ${
                          (platformConfig?.apiLastUpdateStatus ?? 'ONLINE') === 'ONLINE'
                            ? 'bg-emerald-500'
                            : (platformConfig?.apiLastUpdateStatus ?? 'ONLINE') === 'SIMULATED'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`} />
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          (platformConfig?.apiLastUpdateStatus ?? 'ONLINE') === 'ONLINE'
                            ? 'bg-emerald-500'
                            : (platformConfig?.apiLastUpdateStatus ?? 'ONLINE') === 'SIMULATED'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`} />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-bold block leading-none">Estado Atual da Conexão</span>
                        <span className={`text-xs font-black uppercase font-display select-none ${
                          (platformConfig?.apiLastUpdateStatus ?? 'ONLINE') === 'ONLINE'
                            ? 'text-emerald-400'
                            : (platformConfig?.apiLastUpdateStatus ?? 'ONLINE') === 'SIMULATED'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}>
                          {platformConfig?.apiLastUpdateStatus ?? 'ONLINE'}
                        </span>
                      </div>
                    </div>

                    {/* Diagnostic information logs */}
                    <div className="space-y-2.5 text-xs text-slate-300 text-left">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Última leitura de preços bem sucedida</span>
                        <span className="font-mono text-[10px] text-slate-200">{platformConfig?.apiLastFetchTime || 'N/A'}</span>
                      </div>

                      <div className="pt-2 border-t border-slate-900">
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Mensagem de Diagnóstico</span>
                        <p className="text-[10px] text-slate-400 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/50 leading-relaxed font-sans">
                          "{platformConfig?.apiLastUpdateMessage || 'Nenhuma mensagem de log registada.'}"
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* CONNECTION RUNTIME DIAGNOSTIC HARDWARE TESTER */}
                <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 space-y-4">
                  <h4 className="font-display font-bold text-xs text-amber-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
                    🛠️ Verificador de Conectividade em Angola
                  </h4>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Execute um teste físico de ping e handshake a partir deste terminal para verificar as latências directas da rede e filtrar furos locais.
                  </p>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={connectionTest.status === 'TESTING'}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-semibold font-display text-[11px] py-2.5 px-4 rounded-xl transition-all border border-slate-800 hover:border-amber-500/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Activity size={14} className={connectionTest.status === 'TESTING' ? 'text-amber-500 animate-spin' : 'text-slate-400'} />
                    {connectionTest.status === 'TESTING' ? 'A medir latência...' : 'Ping à rede Binance'}
                  </button>

                  {connectionTest.status !== 'IDLE' && (
                    <div className="space-y-2.5 border-t border-slate-900 pt-3 text-[10px] font-mono text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Status do Ensaio:</span>
                        <span className={`font-bold ${
                          connectionTest.status === 'SUCCESS' ? 'text-emerald-400' : connectionTest.status === 'FAILED' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                          {connectionTest.status}
                        </span>
                      </div>

                      {connectionTest.latency !== null && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Tempo de Resposta:</span>
                          <span className="text-white font-bold">{connectionTest.latency} ms</span>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[140px]">
                        <div className="text-slate-500 font-sans font-bold uppercase text-[8px] tracking-wider mb-1">Terminal de Diagnóstico</div>
                        <p className="font-sans mb-1 text-slate-300">{connectionTest.message}</p>
                        {connectionTest.sample && (
                          <pre className="text-[9px] text-emerald-400 bg-black/40 p-1.5 rounded border border-slate-800 mt-1 max-h-[100px] overflow-y-auto">
                            {connectionTest.sample}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>
              
            </div>
          </div>
        )}

      </div>

    </div>

  </div>
  );
}
