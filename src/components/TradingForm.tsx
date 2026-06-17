import { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { Asset } from '../types';
import { Clock, ArrowUpRight, ArrowDownRight, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatKz, formatKzNum } from '../utils';

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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-full flex flex-col justify-between" id="trading-form-container">
      
      <div className="space-y-4">
        <h3 className="text-white font-display font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-2.5">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
          Executar Contrato Rápido
        </h3>

        {/* Dynamic Warning Notification banner */}
        {notif && (
          <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 animate-pulse-subtle ${
            notif.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
              : 'bg-red-500/10 text-red-500 border border-red-500/15'
          }`} id="trading-notification">
            <ShieldCheck size={14} className="shrink-0" />
            <span>{notif.message}</span>
          </div>
        )}

        {isMarketClosed && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex gap-2 items-center" id="market-closed-banner">
            <AlertTriangle size={15} />
            <span>Mercado Fechado pelo Administrador da Plataforma.</span>
          </div>
        )}

        <div className="space-y-4">
          
          {/* Investment amount in Kwanzas */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="binary-investment" className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Valor do Investimento
              </label>
              <span className="text-[9px] text-slate-500 font-mono">
                Limites: {formatKzNum(minAmt)} - {formatKz(maxAmt)}
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono font-bold">
                Kz
              </span>
            </div>
          </div>

          {/* Quick investment buttons based on config */}
          <div className="grid grid-cols-4 gap-1" id="quick-value-buttons">
            {quickVals.map(val => (
              <button
                key={val}
                onClick={() => setInvestment(val)}
                className={`py-1.5 rounded bg-slate-950 text-[10px] font-mono border hover:border-slate-700 hover:text-white transition-all ${
                  investment === val ? 'border-amber-500/50 text-amber-400' : 'border-slate-900 text-slate-500'
                }`}
              >
                {formatKzNum(val)}
              </button>
            ))}
          </div>

          {/* Timers list */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
              Duração do Contrato Rápido
            </label>
            <div className="grid grid-cols-3 gap-2" id="contract-duration-buttons">
              {[
                { label: '30 seg', s: 30 },
                { label: '60 seg', s: 60 },
                { label: '120 seg', s: 120 }
              ].map((item) => (
                <button
                  key={item.s}
                  onClick={() => setDuration(item.s)}
                  className={`py-2 px-1 rounded-lg text-xs font-mono font-medium border transition-all flex items-center justify-center gap-1 ${
                    duration === item.s 
                      ? 'bg-slate-800 text-amber-400 border-amber-500/40 font-bold' 
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <Clock size={11} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payout forecast indicators based on current multiplier */}
          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Ativo Selecionado:</span>
              <span className="text-white font-semibold">{asset.name} ({asset.symbol})</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Rendimento Payout Fixo:</span>
              <span className="text-emerald-500 font-semibold">+{payoutPct}% (Retorno)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Possível Retorno (Se Vencer):</span>
              <span className="text-emerald-500 font-bold">{formatKz(investment * (1 + payoutPct / 100))}</span>
            </div>
          </div>

          {/* High Impact Binary predictions */}
          <div className="grid grid-cols-2 gap-3 pt-2" id="prediction-action-buttons">
            <button
              id="binary-up-btn"
              onClick={() => handleBinaryTradeSubmit('UP')}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-emerald-950/20 active:translate-y-0.5 transition-all uppercase"
            >
              <div className="flex items-center gap-1 font-bold">
                <ArrowUpRight size={15} /> Alto (Sobe)
              </div>
            </button>
            <button
              id="binary-down-btn"
              onClick={() => handleBinaryTradeSubmit('DOWN')}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-4 rounded-lg font-bold text-xs flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-red-950/20 active:translate-y-0.5 transition-all uppercase"
            >
              <div className="flex items-center gap-1 font-bold">
                <ArrowDownRight size={15} /> Baixo (Desce)
              </div>
            </button>
          </div>
        </div>

      </div>

      <div className="mt-6 border-t border-slate-800/60 pt-3 text-[10px] text-slate-500 text-center select-none">
        Negocie com responsabilidade. Ativos digitais possuem alta volatilidade.
      </div>

    </div>
  );
}
