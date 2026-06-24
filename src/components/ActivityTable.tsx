import { useTrading } from '../context/TradingContext';
import { Trade } from '../types';
import { RefreshCw, Play, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { formatKz } from '../utils';

export default function ActivityTable() {
  const { trades, closeSpotTrade, currentUser } = useTrading();

  if (!currentUser) return null;

  // Filter trades placed by current user
  const userTrades = trades.filter(t => t.userId === currentUser.id);
  const openTrades = userTrades.filter(t => t.status === 'OPEN');
  const closedTrades = userTrades.filter(t => t.status === 'CLOSED');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      
      {/* 1. SECTOR: ACTIVE OPEN TRADING POSITIONS */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-tight">
              Posições Abertas ({openTrades.length})
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Monitorização em Tempo Real</span>
        </div>

        {openTrades.length === 0 ? (
          <div className="border border-slate-800/80 rounded-xl p-8 text-center text-xs text-slate-500 bg-slate-950/20">
            Nenhuma operação aberta no momento. Utilize o painel de ordens para transacionar.
          </div>
        ) : (
          <div className="overflow-x-auto select-none rounded-xl border border-slate-800/80 bg-slate-950/20">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 font-medium whitespace-nowrap">
                  <th className="p-3">Ativo</th>
                  <th className="p-3">Tipo / Modo</th>
                  <th className="p-3">Preço Entrada</th>
                  <th className="p-3">Investimento / Unidades</th>
                  <th className="p-3">Tempo Restante</th>
                  <th className="p-3 text-right">Lucro/Perda</th>
                  <th className="p-3 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {openTrades.map(trade => {
                  const isSpot = trade.mode === 'SPOT';
                  const isBuy = trade.type === 'BUY';
                  const isUp = trade.prediction === 'UP';
                  const isProfit = trade.profit >= 0;

                  return (
                    <tr key={trade.id} className="hover:bg-slate-800/10 font-mono transition-all whitespace-nowrap">
                      <td className="p-3">
                        <div className="font-semibold text-white">{trade.assetSymbol}</div>
                        <div className="text-[10px] text-slate-500">{trade.assetName}</div>
                      </td>
                      <td className="p-3">
                        {isSpot ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBuy 
                              ? 'bg-emerald-500/15 text-emerald-400' 
                              : 'bg-red-500/15 text-red-400'
                          }`}>
                            {isBuy ? 'COMPRA' : 'VENDA'} SPOT
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isUp 
                              ? 'bg-emerald-500/15 text-emerald-400' 
                              : 'bg-red-500/15 text-red-400'
                          }`}>
                            {isUp ? 'ALTA (↑)' : 'BAIXA (↓)'} Rápida
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-300 font-bold">{formatKz(trade.openPrice)}</td>
                      <td className="p-3 text-slate-300 font-semibold">
                        {isSpot ? `${trade.quantity} un.` : `${formatKz(trade.quantity)}`}
                      </td>
                      <td className="p-3">
                        {isSpot ? (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock size={12} /> Aberto
                          </span>
                        ) : (
                          <span className="text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                            <Clock size={12} /> {trade.timeLeft}s
                          </span>
                        )}
                      </td>
                      <td className={`p-3 text-right font-bold text-sm ${isProfit ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isProfit ? '+' : ''}{formatKz(trade.profit)}
                      </td>
                      <td className="p-3 text-center">
                        {isSpot ? (
                          <button
                            id={`close-trade-${trade.id}`}
                            onClick={() => closeSpotTrade(trade.id)}
                            className="bg-red-500/10 border border-red-500/30 hover:bg-red-600 text-red-400 hover:text-white transition-all text-[11px] font-bold px-3 py-1 rounded-md"
                          >
                            Fechar
                          </button>
                        ) : (
                          <button
                            disabled
                            className="bg-slate-800 text-slate-500 cursor-not-allowed text-[11px] px-3 py-1 rounded"
                          >
                            Aguardar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. SECTOR: HISTORICAL COMPLETED DEALS */}
      <div>
        <h3 className="font-display font-bold text-sm text-slate-400 uppercase tracking-tight mb-4">
          Historial de Negócios ({closedTrades.length})
        </h3>

        {closedTrades.length === 0 ? (
          <div className="border border-slate-800/80 rounded-xl p-8 text-center text-xs text-slate-500 bg-slate-950/20">
            Ainda não fechou nenhuma operação nesta conta.
          </div>
        ) : (
          <div className="overflow-x-auto select-none rounded-xl border border-slate-800/80 bg-slate-950/20">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-500 font-medium whitespace-nowrap">
                  <th className="p-3">Ativo / ID</th>
                  <th className="p-3">Predição / Posição</th>
                  <th className="p-3">Preço Entrada</th>
                  <th className="p-3">Preço Sair / Expira</th>
                  <th className="p-3">Duração do Contrato</th>
                  <th className="p-3 text-right">Resultado Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-400">
                {closedTrades.map(trade => {
                  const won = trade.profit > 0;
                  const isSpot = trade.mode === 'SPOT';
                  const isUP = trade.prediction === 'UP';

                  return (
                    <tr key={trade.id} className="hover:bg-slate-800/10 font-mono transition-all whitespace-nowrap">
                      <td className="p-3">
                        <div className="font-bold text-white">{trade.assetSymbol}</div>
                        <div className="text-[10px] text-slate-500">ID: {trade.id.split('-')[1]}</div>
                      </td>
                      <td className="p-3">
                        {isSpot ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            SPOT {trade.type === 'BUY' ? 'COMPRADO' : 'VENDIDO'}
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            isUP ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'
                          }`}>
                            TIMER {isUP ? 'SUMIR AO' : 'CAIR AO'}
                          </span>
                        )}
                      </td>
                      <td className="p-3">{formatKz(trade.openPrice)}</td>
                      <td className="p-3 font-semibold text-slate-300">
                        {trade.closePrice ? formatKz(trade.closePrice) : 'S/D'}
                      </td>
                      <td className="p-3 text-slate-500 text-[11px]">
                        {isSpot ? 'CFD Permanente' : `${trade.duration}s Expirado`}
                      </td>
                      <td className={`p-3 text-right font-bold text-sm ${won ? 'text-emerald-500' : 'text-red-500'}`}>
                        {won ? '+' : ''}{formatKz(trade.profit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
