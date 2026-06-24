import { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { Asset } from '../types';
import { Clock, ArrowUpRight, ArrowDownRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatKz, formatKzNum, formatCompactKz } from '../utils';
import { playSound } from '../lib/audio';

interface TradingFormProps {
  asset: Asset | null;
}

export default function TradingForm({ asset }: TradingFormProps) {
  const { 
    currentUser, 
    placeBinaryTrade,
    platformConfig 
  } = useTrading();

  const minAmt = platformConfig.minTradeAmount ?? 1000;
  const maxAmt = platformConfig.maxTradeAmount ?? 10000;
  const payoutPct = platformConfig.winPayoutPercentage ?? 80;

  // Investment is initialized to minAmt and updated if minAmt changes
  const [investment, setInvestment] = useState(minAmt);
  const [duration, setDuration] = useState(60); // 60 seconds default
  const [notif, setNotif] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Sync default investment amount with min value of platformConfig
  useEffect(() => {
    setInvestment(prev => {
      if (prev < minAmt) return minAmt;
      if (prev > maxAmt) return maxAmt;
      return prev;
    });
  }, [minAmt, maxAmt]);

  if (!asset) return null;

  const userBalance = currentUser ? (currentUser.isDemo ? currentUser.demoBalance : currentUser.balance) : 0;
  const isMarketClosed = platformConfig.marketStatus === 'CLOSED';

  const triggerNotif = (type: 'success' | 'error', message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 4000);
  };

  const handleBinaryTradeSubmit = (prediction: 'UP' | 'DOWN') => {
    if (!currentUser) return;
    if (isMarketClosed) {
      triggerNotif('error', 'O mercado está fechado no momento.');
      return;
    }
    if (investment < minAmt) {
      triggerNotif('error', `O valor mínimo para negociar é de ${formatKz(minAmt)}.`);
      return;
    }
    if (investment > maxAmt) {
      triggerNotif('error', `O valor máximo permitido por operação é de ${formatKz(maxAmt)}.`);
      return;
    }
    if (userBalance < investment) {
      triggerNotif('error', 'Saldo de Kwanza insuficiente para este investimento.');
      return;
    }

    const success = placeBinaryTrade(asset.id, prediction, investment, duration);
    if (success) {
      if (prediction === 'UP') {
        playSound.tradeOpenUp();
      } else {
        playSound.tradeOpenDown();
      }
      triggerNotif('success', `Contrato Rápido (${prediction === 'UP' ? 'ALTA' : 'BAIXA'}) de ${duration}s registado!`);
    } else {
      triggerNotif('error', 'Falha ao colocar o contrato rápido.');
    }
  };

  // Generate safe dynamic quick buttons
  const quickVals = Array.from(new Set([
    minAmt,
    Math.min(maxAmt, minAmt * 2),
    Math.min(maxAmt, minAmt * 5),
    maxAmt
  ])).sort((a, b) => a - b);

  return (
    <div className="bg-transparent lg:bg-slate-900 border-none lg:border lg:border-slate-800 rounded-none lg:rounded-xl p-0 lg:p-5 h-full flex flex-col justify-between" id="trading-form-container">
      
      <div className="space-y-3.5 lg:space-y-4">
        <h3 className="hidden lg:flex text-white font-display font-bold text-sm uppercase tracking-wider items-center gap-1.5 border-b border-slate-800/80 pb-2.5">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          Executar Contrato Rápido
        </h3>

        {/* Dynamic Warning Notification banner */}
        {notif && (
          <div className={`p-2.5 rounded-lg text-[11px] font-medium flex items-center gap-2 animate-pulse-subtle ${
            notif.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
              : 'bg-red-500/10 text-red-500 border border-red-500/15'
          }`} id="trading-notification">
            <ShieldCheck size={13} className="shrink-0" />
            <span className="truncate">{notif.message}</span>
          </div>
        )}

        {isMarketClosed && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] p-2.5 rounded-xl flex gap-2 items-center" id="market-closed-banner">
            <AlertTriangle size={14} className="shrink-0" />
            <span>Mercado Fechado pelo Administrador.</span>
          </div>
        )}

        <div className="flex flex-col gap-3.5">
          
          {/* High Impact Binary predictions - ELEVATED TO THE TOP ON MOBILE, AT THE BOTTOM ON DESKTOP */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5 pb-0.5 order-1 lg:order-5" id="prediction-action-buttons">
            <button
              id="binary-up-btn"
              onClick={() => handleBinaryTradeSubmit('UP')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 sm:py-4 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-emerald-950/20 active:translate-y-0.5 transition-all uppercase"
            >
              <div className="flex items-center gap-1 font-bold whitespace-nowrap">
                <ArrowUpRight size={14} /> Alto (Sobe)
              </div>
            </button>
            <button
              id="binary-down-btn"
              onClick={() => handleBinaryTradeSubmit('DOWN')}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-3.5 sm:py-4 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-red-950/20 active:translate-y-0.5 transition-all uppercase"
            >
              <div className="flex items-center gap-1 font-bold whitespace-nowrap">
                <ArrowDownRight size={14} /> Baixo (Desce)
              </div>
            </button>
          </div>

          {/* Investment amount in Kwanzas */}
          <div className="order-2 lg:order-1">
            <div className="flex justify-between items-center mb-1 gap-1">
              <label htmlFor="binary-investment" className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-bold whitespace-nowrap">
                Investimento (Kz)
              </label>
              <span className="text-[8px] sm:text-[9px] text-slate-500 font-mono whitespace-nowrap">
                Limites: {formatCompactKz(minAmt)} - {formatCompactKz(maxAmt)}
              </span>
            </div>
            <div className="relative">
              <input
                id="binary-investment"
                type="number"
                min={minAmt}
                max={maxAmt}
                step="100"
                value={investment}
                onChange={(e) => setInvestment(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono font-bold">
                Kz
              </span>
            </div>
          </div>

          {/* Quick investment buttons based on config */}
          <div className="grid grid-cols-4 gap-1 order-3 lg:order-2" id="quick-value-buttons">
            {quickVals.map(val => (
              <button
                key={val}
                onClick={() => setInvestment(val)}
                className={`py-1 rounded bg-slate-950 text-[9px] sm:text-[10px] font-mono border hover:border-slate-700 hover:text-white transition-all whitespace-nowrap ${
                  investment === val ? 'border-amber-500/50 text-amber-400 font-bold' : 'border-slate-900 text-slate-500'
                }`}
              >
                +{formatCompactKz(val)}
              </button>
            ))}
          </div>

          {/* Timers list */}
          <div className="order-4 lg:order-3">
            <label className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1 whitespace-nowrap">
              Duração / Tempo
            </label>
            <div className="grid grid-cols-3 gap-1.5" id="contract-duration-buttons">
              {[
                { label: '30s', s: 30 },
                { label: '1m', s: 60 },
                { label: '2m', s: 120 }
              ].map((item) => (
                <button
                  key={item.s}
                  onClick={() => setDuration(item.s)}
                  className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-medium border transition-all flex items-center justify-center gap-1 ${
                    duration === item.s 
                      ? 'bg-slate-800 text-amber-400 border-amber-500/40 font-bold' 
                      : 'bg-slate-950 text-slate-500 border-slate-900 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Clock size={10} className="shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payout forecast indicators based on current multiplier */}
          <div className="bg-slate-950/40 lg:bg-slate-950 rounded-xl p-2.5 border border-slate-900 lg:border-slate-800 space-y-1 text-[10px] sm:text-xs font-mono order-5 lg:order-4">
            <div className="flex justify-between items-center text-slate-400">
              <span className="whitespace-nowrap">Ativo:</span>
              <span className="text-white font-semibold whitespace-nowrap">{asset ? asset.symbol : ''}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="whitespace-nowrap">Retorno / Payout:</span>
              <span className="text-emerald-500 font-semibold whitespace-nowrap">+{payoutPct}%</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 lg:text-slate-400 pt-0.5 border-t border-slate-900/60 lg:border-transparent">
              <span className="whitespace-nowrap font-medium text-slate-400">Lucro Possível:</span>
              <span className="text-emerald-400 font-bold whitespace-nowrap">{formatKz(investment * (1 + payoutPct / 100))}</span>
            </div>
          </div>

        </div>

      </div>

      <div className="hidden lg:block mt-6 border-t border-slate-800/60 pt-3 text-[10px] text-slate-500 text-center select-none">
        Negocie com responsabilidade. Ativos digitais possuem alta volatilidade.
      </div>

    </div>
  );
}
