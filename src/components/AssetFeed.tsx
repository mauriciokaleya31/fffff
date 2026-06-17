import { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { Asset, AssetCategory } from '../types';
import { Search, Flame, Coins, Droplet, Wheat, Globe, Landmark } from 'lucide-react';

export default function AssetFeed() {
  const { assets, activeAsset, setActiveAssetId } = useTrading();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<AssetCategory | 'all'>('all');

  // Filter items matching search and selected tab
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || asset.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'currencies':
        return <Coins size={14} className="text-emerald-400" />;
      default:
        return <Globe size={14} className="text-slate-400" />;
    }
  };

  const getCategoryLabel = (category: AssetCategory) => {
    switch (category) {
      case 'currencies':
        return 'Principais Moedas';
      default:
        return 'Altcoins / Meme';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-[750px]">
      
      {/* Header with Search */}
      <div className="p-4 border-b border-slate-800">
        <h3 className="font-display font-bold text-sm tracking-tight text-white mb-3 uppercase text-slate-400">
          Feed de Criptoativos em Tempo Real
        </h3>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            id="asset-search"
            type="text"
            placeholder="Pesquisar Bitcoin, Ethereum, Solana, DOGE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 text-xs border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-mono"
          />
        </div>
      </div>

      {/* Categories Tabs Filter */}
      <div className="flex gap-1 overflow-x-auto p-2 bg-slate-950/40 border-b border-slate-800 scrollbar-none scroll-smooth">
        <button
          onClick={() => setActiveTab('all')}
          className={`text-[10px] md:text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-slate-800 text-white border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Todos os Ativos
        </button>
        {(['currencies', 'others'] as AssetCategory[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[10px] md:text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.2 break-normal ${
              activeTab === tab
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {getCategoryIcon(tab)}
            <span className="capitalize">{tab === 'currencies' ? 'Principais' : 'Altcoins / Memes'}</span>
          </button>
        ))}
      </div>

      {/* Assets Listing List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-xs text-slate-500">Nenhum ativo encontrado.</p>
          </div>
        ) : (
          filteredAssets.map(asset => {
            const isActive = activeAsset?.id === asset.id;
            const isNegative = asset.changePercent < 0;
            
            // Draw brief custom mini-sparkline SVG path
            const sparkPoints = asset.history.slice(-10);
            let pathD = '';
            if (sparkPoints.length > 2) {
              const minP = Math.min(...sparkPoints.map(p => p.price));
              const maxP = Math.max(...sparkPoints.map(p => p.price));
              const span = maxP - minP || 1;
              const coords = sparkPoints.map((p, idx) => {
                const x = (idx / (sparkPoints.length - 1)) * 50;
                const y = 20 - ((p.price - minP) / span) * 16; // 2px margin top/bottom
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              pathD = `M ${coords.join(' L ')}`;
            }

            return (
              <button
                key={asset.id}
                id={`feed-card-${asset.id}`}
                onClick={() => setActiveAssetId(asset.id)}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                  isActive 
                    ? 'bg-slate-800/80 border border-slate-700 shadow-md shadow-slate-950' 
                    : 'bg-transparent border border-transparent hover:bg-slate-800/25'
                }`}
              >
                {/* Left side: Group icon and asset name */}
                <div className="flex items-center gap-3 w-1/2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-slate-700">
                    {getCategoryIcon(asset.category)}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-white tracking-wider">{asset.symbol}</span>
                      <span className="text-[9px] bg-slate-950 text-slate-400 px-1 py-0.2 rounded font-mono font-medium scale-90">
                        CRYPTO
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{asset.name}</p>
                  </div>
                </div>

                {/* Center side: Sparkline graph */}
                <div className="hidden sm:block w-14 h-6">
                  {pathD && (
                    <svg className="w-full h-full" viewBox="0 0 50 20">
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isNegative ? '#ef4444' : '#10b981'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Right side: Prices & Percent change */}
                <div className="text-right w-1/3">
                  <p className="text-xs font-mono font-bold text-white">
                    {asset.price.toLocaleString('pt-AO')}
                  </p>
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-md font-mono font-semibold mt-1 ${
                    isNegative 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/15' 
                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15'
                  }`}>
                    {isNegative ? '' : '+'}{asset.changePercent}%
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center rounded-b-xl">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Preços em tempo real via Binance API
        </span>
        <span className="font-mono">BINANCE: ATIVO</span>
      </div>
    </div>
  );
}
