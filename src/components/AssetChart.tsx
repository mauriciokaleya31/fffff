import React, { useState, useMemo } from 'react';
import { Asset } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AreaChart, 
  Layers, 
  Flame, 
  Activity, 
  Eye, 
  EyeOff, 
  Settings, 
  SlidersHorizontal 
} from 'lucide-react';

interface AssetChartProps {
  asset: Asset | null;
}

type ChartType = 'area' | 'candle' | 'heikin' | 'bars';
type TimeFrame = '5s' | '15s' | '1m' | '5m' | '1h';

export default function AssetChart({ asset }: AssetChartProps) {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1m');
  const [showBollinger, setShowBollinger] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number } | null>(null);

  if (!asset) {
    return (
      <div className="bg-[#09090b] border border-zinc-805/80 rounded-xl p-8 flex flex-col items-center justify-center h-[480px] text-center">
        <p className="text-zinc-500 font-medium">Selecione um ativo para visualizar os gráficos de mercado.</p>
      </div>
    );
  }

  // Use the historical price points
  const rawPrices = asset.history || [];
  const isLoss = asset.changePercent < 0;

  // Filter or scale data based on simulated timeframe selection to make it responsive
  const prices = useMemo(() => {
    if (!rawPrices.length) return [];
    
    let sliceCount = rawPrices.length;
    switch (timeFrame) {
      case '5s': sliceCount = 10; break;
      case '15s': sliceCount = 15; break;
      case '1m': sliceCount = 30; break;
      case '5m': sliceCount = 45; break;
      case '1h': sliceCount = 60; break;
    }
    
    return rawPrices.slice(-sliceCount);
  }, [rawPrices, timeFrame]);

  // Compute boundaries for drawing
  const minPrice = useMemo(() => {
    const base = Math.min(...prices.map(p => p.price));
    return base * 0.9985;
  }, [prices]);

  const maxPrice = useMemo(() => {
    const base = Math.max(...prices.map(p => p.price));
    return base * 1.0015;
  }, [prices]);

  const priceRange = useMemo(() => {
    return (maxPrice - minPrice) || 1;
  }, [maxPrice, minPrice]);

  // Coordinate dimensions
  const chartWidth = 900;
  const chartHeight = 220; // reserved height for price chart
  const rsiHeight = 45;    // reserved height for RSI pane at bottom
  const rsiOffset = 235;   // Y start for RSI
  const totalSvgHeight = 290;

  // Map prices to coordinate space
  const points = useMemo(() => {
    return prices.map((p, index) => {
      const x = (index / (prices.length - 1)) * (chartWidth - 60); // reserve 60px right side margin
      const y = chartHeight - ((p.price - minPrice) / priceRange) * chartHeight;
      return { x, y, price: p.price, time: p.time };
    });
  }, [prices, minPrice, priceRange]);

  // Generate paths for area & outline
  const { linePath, fillPath } = useMemo(() => {
    if (points.length < 2) return { linePath: '', fillPath: '' };
    const linePath = `M ${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
    const fillPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)},${chartHeight} L ${points[0].x.toFixed(1)},${chartHeight} Z`;
    return { linePath, fillPath };
  }, [points]);

  // Compute Japanese Candlesticks (OHLC simulation)
  const candlesticks = useMemo(() => {
    return points.map((pt, idx) => {
      const prevPt = points[idx - 1] || pt;
      const isUp = pt.price >= prevPt.price;
      
      const openVal = prevPt.price;
      const closeVal = pt.price;
      // High-low mock variations
      const diff = Math.abs(closeVal - openVal) || 2;
      const highVal = Math.max(openVal, closeVal) + (diff * 0.4);
      const lowVal = Math.min(openVal, closeVal) - (diff * 0.4);

      const topWickY = chartHeight - ((highVal - minPrice) / priceRange) * chartHeight;
      const bottomWickY = chartHeight - ((lowVal - minPrice) / priceRange) * chartHeight;
      const bodyTopY = chartHeight - ((Math.max(openVal, closeVal) - minPrice) / priceRange) * chartHeight;
      const bodyBottomY = chartHeight - ((Math.min(openVal, closeVal) - minPrice) / priceRange) * chartHeight;
      const bodyHeight = Math.max(3, Math.abs(bodyTopY - bodyBottomY));

      return {
        x: pt.x,
        topWickY,
        bottomWickY,
        bodyTopY,
        bodyHeight,
        isUp,
        price: pt.price,
        time: pt.time
      };
    });
  }, [points, minPrice, priceRange]);

  // Compute Heikin Ashi Candlesticks (smooth moving trends)
  const heikinCandles = useMemo(() => {
    const candles: any[] = [];
    let prevHOpen = points[0]?.price || minPrice;
    let prevHClose = points[0]?.price || minPrice;

    points.forEach((pt, idx) => {
      const prevPt = points[idx - 1] || pt;
      const open = prevPt.price;
      const close = pt.price;
      // High-low mock
      const diff = Math.abs(close - open) || 2;
      const high = Math.max(open, close) + (diff * 0.35);
      const low = Math.min(open, close) - (diff * 0.35);

      const hClose = (open + high + low + close) / 4;
      const hOpen = (prevHOpen + prevHClose) / 2;
      const hHigh = Math.max(high, hOpen, hClose);
      const hLow = Math.min(low, hOpen, hClose);

      const isUp = hClose >= hOpen;

      const topWickY = chartHeight - ((hHigh - minPrice) / priceRange) * chartHeight;
      const bottomWickY = chartHeight - ((hLow - minPrice) / priceRange) * chartHeight;
      const bodyTopY = chartHeight - ((Math.max(hOpen, hClose) - minPrice) / priceRange) * chartHeight;
      const bodyBottomY = chartHeight - ((Math.min(hOpen, hClose) - minPrice) / priceRange) * chartHeight;
      const bodyHeight = Math.max(3, Math.abs(bodyTopY - bodyBottomY));

      candles.push({
        x: pt.x,
        topWickY,
        bottomWickY,
        bodyTopY,
        bodyHeight,
        isUp,
        price: hClose
      });

      prevHOpen = hOpen;
      prevHClose = hClose;
    });

    return candles;
  }, [points, minPrice, priceRange]);

  // Technical Indicators: Bollinger Bands (Period = 8, Multiplier = 2)
  const bollingerBands = useMemo(() => {
    const period = 8;
    const bandPoints: { x: number; upperY: number; lowerY: number; middleY: number }[] = [];

    for (let i = 0; i < points.length; i++) {
      const startIdx = Math.max(0, i - period + 1);
      const slice = points.slice(startIdx, i + 1);
      const mean = slice.reduce((sum, p) => sum + p.price, 0) / slice.length;
      
      const variance = slice.reduce((sum, p) => sum + Math.pow(p.price - mean, 2), 0) / slice.length;
      const stdDev = Math.sqrt(variance) || 1;

      const upperPrice = mean + (1.6 * stdDev);
      const lowerPrice = mean - (1.6 * stdDev);

      const upperY = chartHeight - ((upperPrice - minPrice) / priceRange) * chartHeight;
      const lowerY = chartHeight - ((lowerPrice - minPrice) / priceRange) * chartHeight;
      const middleY = chartHeight - ((mean - minPrice) / priceRange) * chartHeight;

      bandPoints.push({
        x: points[i].x,
        upperY,
        lowerY,
        middleY
      });
    }
    return bandPoints;
  }, [points, minPrice, priceRange]);

  // Bollinger Area Polygon Fill
  const bollingerPolyD = useMemo(() => {
    if (bollingerBands.length < 2) return '';
    const upperLine = bollingerBands.map(b => `${b.x.toFixed(1)},${b.upperY.toFixed(1)}`).join(' L ');
    const lowerLine = [...bollingerBands].reverse().map(b => `${b.x.toFixed(1)},${b.lowerY.toFixed(1)}`).join(' L ');
    return `M ${upperLine} L ${lowerLine} Z`;
  }, [bollingerBands]);

  // Technical Indicators: Simple Moving Average SMA (Period = 5)
  const smaPoints = useMemo(() => {
    const period = 5;
    const output: { x: number; y: number }[] = [];

    for (let i = 0; i < points.length; i++) {
      const startIdx = Math.max(0, i - period + 1);
      const slice = points.slice(startIdx, i + 1);
      const avgPrice = slice.reduce((sum, p) => sum + p.price, 0) / slice.length;
      const y = chartHeight - ((avgPrice - minPrice) / priceRange) * chartHeight;
      output.push({ x: points[i].x, y });
    }
    return output;
  }, [points, minPrice, priceRange]);

  const smaLinePath = useMemo(() => {
    if (smaPoints.length < 2) return '';
    return `M ${smaPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
  }, [smaPoints]);

  // Support & Resistance horizontal targets
  const s1 = minPrice * 1.0004;
  const r1 = maxPrice * 0.9996;
  const supportY = chartHeight - ((s1 - minPrice) / priceRange) * chartHeight;
  const resistanceY = chartHeight - ((r1 - minPrice) / priceRange) * chartHeight;

  // Real-time live coordinates of the current point (last point)
  const currentPoint = points[points.length - 1];

  // Simulated live RSI line (0 to 100 OSCILLATOR)
  const rsiLinePath = useMemo(() => {
    if (points.length < 2) return '';
    // Let's calculate simple smoothed oscillator based on price slope change
    const pathPoints = points.map((p, index) => {
      const prevPrice = points[index - 1]?.price || p.price;
      const isUp = p.price >= prevPrice;
      const change = Math.abs(p.price - prevPrice);
      
      // Map pseudo-RSI around 50 level based on sine of history index and delta
      const wave = Math.sin(index * 0.4) * 15;
      const deltaFactor = Math.min(20, (change / p.price) * 8000);
      const rsiValue = 50 + wave + (isUp ? deltaFactor : -deltaFactor);
      const clampedRsi = Math.max(10, Math.min(90, rsiValue));
      
      // Map 0-100 to rsiHeight
      const y = rsiOffset + (rsiHeight - (clampedRsi / 100) * rsiHeight);
      return `${p.x.toFixed(1)},${y.toFixed(1)}`;
    });
    return `M ${pathPoints.join(' L ')}`;
  }, [points]);

  return (
    <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4 flex flex-col h-[520px] shadow-2xl relative overflow-hidden transition-all text-xs">
      
      {/* Visual Ambient Grid background glow for space terminal */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-rose-500/[0.02] rounded-full blur-[90px] pointer-events-none" />

      {/* Header Info Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 z-10 pb-3 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center font-bold text-emerald-400 font-mono shadow">
            {asset.symbol.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-zinc-100">{asset.name}</span>
              <span className="px-1.5 py-0.2 font-mono text-[9px] font-extrabold bg-zinc-900 border border-zinc-800 text-zinc-400 rounded">
                CRYPTO: {asset.symbol}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] mt-0.5">
              <span>{asset.description}</span>
            </div>
          </div>
        </div>

        {/* Action controls button rig */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Chart selector type */}
          <div className="flex bg-zinc-950 p-1 border border-zinc-850 rounded-lg">
            <button
              onClick={() => setChartType('area')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all transition-transform ${
                chartType === 'area' ? 'bg-zinc-805 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-white'
              }`}
              title="Área Neon"
            >
              Área
            </button>
            <button
              onClick={() => setChartType('candle')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                chartType === 'candle' ? 'bg-zinc-805 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-white'
              }`}
              title="Velas Japonesas"
            >
              Velas
            </button>
            <button
              onClick={() => setChartType('heikin')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                chartType === 'heikin' ? 'bg-zinc-805 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-white'
              }`}
              title="Heikin Ashi"
            >
              H-Ashi
            </button>
            <button
              onClick={() => setChartType('bars')}
              className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                chartType === 'bars' ? 'bg-zinc-805 text-emerald-400 border border-emerald-500/30' : 'text-zinc-500 hover:text-white'
              }`}
              title="Gráfico de Barras"
            >
              Barras
            </button>
          </div>

          {/* Timeframe scaler selection (simulating high-frequency streaming speeds) */}
          <div className="flex bg-zinc-950 p-1 border border-zinc-850 rounded-lg">
            {(['5s', '15s', '1m', '5m', '1h'] as TimeFrame[]).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeFrame(tf)}
                className={`w-7 py-0.5 rounded text-[10px] font-mono text-center transition-all ${
                  timeFrame === tf ? 'text-emerald-400 font-extrabold bg-zinc-900 border border-zinc-800' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Indicators toggler toggles */}
          <div className="flex bg-zinc-950 p-1 border border-zinc-850 rounded-lg gap-1">
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-1 rounded text-[9px] font-bold transition-all flex items-center gap-1 ${
                showBollinger ? 'bg-emerald-950/25 text-emerald-400 border border-emerald-500/20' : 'text-zinc-600'
              }`}
              title="Bollinger Bands (Volatility Ranges)"
            >
              BB
            </button>
            <button
              onClick={() => setShowSMA(!showSMA)}
              className={`px-2 py-1 rounded text-[9px] font-bold transition-all flex items-center gap-1 ${
                showSMA ? 'bg-amber-950/30 text-amber-500 border border-amber-500/20' : 'text-zinc-600'
              }`}
              title="Simple Moving Average Trend line"
            >
              SMA
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-1 rounded text-[9px] font-bold transition-all flex items-center gap-1 ${
                showRSI ? 'bg-purple-950/30 text-purple-400 border border-purple-500/20' : 'text-zinc-600'
              }`}
              title="Relative Strength Index Oscillator"
            >
              RSI
            </button>
          </div>
        </div>
      </div>

      {/* Realtime mini tickers overlay bar */}
      <div className="grid grid-cols-4 gap-2 mb-3 bg-zinc-950/80 rounded-lg p-2 border border-zinc-900/40 divide-x divide-zinc-900">
        <div className="flex flex-col items-center justify-center">
          <span className="text-[9px] text-zinc-500 uppercase tracking-tight">Valor de Cotação</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`font-mono text-xs font-bold ${isLoss ? 'text-rose-500' : 'text-emerald-400'}`}>
              {asset.price.toLocaleString('pt-AO')} AOA
            </span>
            {isLoss ? (
              <TrendingDown size={11} className="text-rose-500 animate-pulse" />
            ) : (
              <TrendingUp size={11} className="text-emerald-400 animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-[9px] text-zinc-500 uppercase">Volatilidade (Δ)</span>
          <span className={`font-mono text-[10px] font-semibold mt-0.5 ${isLoss ? 'text-rose-500' : 'text-emerald-400'}`}>
            {isLoss ? '' : '+'}{asset.changePercent.toFixed(2)}%
          </span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-[9px] text-zinc-500 uppercase">Pico Máximo (24H)</span>
          <span className="font-mono text-[10px] text-zinc-300 mt-0.5">{asset.high.toLocaleString('pt-AO')} Kz</span>
        </div>
        <div className="flex flex-col items-center justify-center">
          <span className="text-[9px] text-zinc-500 uppercase">Pico Mínimo (24H)</span>
          <span className="font-mono text-[10px] text-zinc-300 mt-0.5">{asset.low.toLocaleString('pt-AO')} Kz</span>
        </div>
      </div>

      {/* MAIN QXBROKER CHROMATIC CHART VIEWPORT */}
      <div className="flex-1 relative bg-zinc-950 border border-zinc-900/90 rounded-xl overflow-hidden cursor-crosshair group">
        
        {/* Floating live indicator tag widget */}
        {hoverIndex !== null && points[hoverIndex] ? (
          <div className="absolute top-2 left-2 bg-[#0d0d12]/95 border border-zinc-800 rounded px-2.5 py-1.5 shadow-xl shadow-black/80 z-20 pointer-events-none font-mono">
            <div className="flex items-center gap-1 text-[9px] text-zinc-500">
              <Clock size={10} className="text-emerald-500" />
              <span>{points[hoverIndex].time}</span>
            </div>
            <div className="text-[11px] font-extrabold text-zinc-100 mt-0.5">
              Ref: <span className="text-emerald-400">{points[hoverIndex].price.toLocaleString('pt-AO')} AOA</span>
            </div>
          </div>
        ) : (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/40 px-2.5 py-1 rounded text-[9px] text-zinc-400 font-mono pointer-events-none">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span>Transmissão em fluxo contínuo (OTC)</span>
          </div>
        )}

        <svg
          className="w-full h-full overflow-visible select-none"
          viewBox={`0 0 ${chartWidth} ${totalSvgHeight}`}
          preserveAspectRatio="none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = e.clientX - rect.left;
            const relY = e.clientY - rect.top;
            
            // map X coordinate to closest index
            const visibleWidth = chartWidth - 60;
            const pct = relX / (rect.width * (visibleWidth / chartWidth));
            const clampedPct = Math.max(0, Math.min(0.999, pct));
            const idx = Math.floor(clampedPct * prices.length);
            
            setHoverIndex(idx);
            setMouseCoord({ x: relX * (chartWidth / rect.width), y: relY * (totalSvgHeight / rect.height) });
          }}
          onMouseLeave={() => {
            setHoverIndex(null);
            setMouseCoord(null);
          }}
        >
          {/* DEFINITIONS FOR NEON GLOW FILTERS AND GRADIENTS */}
          <defs>
            <linearGradient id="neonGlowUp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="neonGlowDown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <filter id="neonStrokeUp" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neonStrokeDown" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* BACKGROUND VOLUMETRIC Y COORDINATE GRIDS AND LABELS */}
          {[-0.05, 0.15, 0.35, 0.55, 0.75, 0.95].map((pos, idx) => {
            const gridY = chartYOffset(pos);
            const gridVal = maxPrice - (pos * priceRange);
            return (
              <g key={idx}>
                <line
                  x1="0"
                  y1={gridY}
                  x2={chartWidth - 60}
                  y2={gridY}
                  stroke="#1c1917"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                />
                <text
                  x={chartWidth - 55}
                  y={gridY + 3}
                  fill="#52525b"
                  fontSize="8"
                  textAnchor="start"
                  className="font-mono font-medium"
                >
                  {gridVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Support Line Layer (QX style trading targets) */}
          <line
            x1="0"
            y1={supportY}
            x2={chartWidth - 60}
            y2={supportY}
            stroke="#065f46"
            strokeWidth="0.8"
            strokeDasharray="4 4"
            className="opacity-70"
          />
          <text x="10" y={supportY - 4} fill="#059669" fontSize="8" className="font-mono uppercase tracking-wider opacity-60">
            Suporte: {s1.toFixed(1)} Kz
          </text>

          {/* Resistance Line Layer */}
          <line
            x1="0"
            y1={resistanceY}
            x2={chartWidth - 60}
            y2={resistanceY}
            stroke="#9f1239"
            strokeWidth="0.8"
            strokeDasharray="4 4"
            className="opacity-70"
          />
          <text x="10" y={resistanceY + 11} fill="#e11d48" fontSize="8" className="font-mono uppercase tracking-wider opacity-60">
            Resistência: {r1.toFixed(1)} Kz
          </text>

          {/* 1. LAYER BOLLINGER BANDS (If Enabled) */}
          {showBollinger && bollingerPolyD && (
            <g>
              {/* Translucent area fill */}
              <path d={bollingerPolyD} fill="#8b5cf6" fillOpacity="0.03" />
              
              {/* Upper band outline */}
              <path
                d={`M ${bollingerBands.map(b => `${b.x.toFixed(1)},${b.upperY.toFixed(1)}`).join(' L ')}`}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="1"
                strokeOpacity="0.4"
                strokeDasharray="3 3"
              />
              
              {/* Lower band outline */}
              <path
                d={`M ${bollingerBands.map(b => `${b.x.toFixed(1)},${b.lowerY.toFixed(1)}`).join(' L ')}`}
                fill="none"
                stroke="#a78bfa"
                strokeWidth="1"
                strokeOpacity="0.4"
                strokeDasharray="3 3"
              />
            </g>
          )}

          {/* 2. AREA AND OUTLINE GRAPH (LINE TYPE) */}
          {chartType === 'area' && (
            <>
              {/* Neon illuminated fill under the curve */}
              {fillPath && (
                <path d={fillPath} fill={`url(${isLoss ? '#neonGlowDown' : '#neonGlowUp'})`} />
              )}
              {/* Glowing active outline */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={isLoss ? '#f43f5e' : '#10b981'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={isLoss ? 'url(#neonStrokeDown)' : 'url(#neonStrokeUp)'}
                />
              )}
            </>
          )}

          {/* 3. JAPANESE CANDLESTICKS */}
          {chartType === 'candle' && (
            <g>
              {candlesticks.map((candle, idx) => {
                const candleWidth = Math.max(3, ((chartWidth - 60) / prices.length) * 0.6);
                const color = candle.isUp ? '#10b981' : '#f43f5e';
                
                return (
                  <g key={idx}>
                    {/* Wick Line */}
                    <line
                      x1={candle.x}
                      y1={candle.topWickY}
                      x2={candle.x}
                      y2={candle.bottomWickY}
                      stroke={color}
                      strokeWidth="1"
                    />
                    {/* Candle Body */}
                    <rect
                      x={candle.x - candleWidth / 2}
                      y={candle.bodyTopY}
                      width={candleWidth}
                      height={candle.bodyHeight}
                      fill={color}
                      stroke={color}
                      strokeWidth="0.5"
                      rx="0.5"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* 4. HEIKIN ASHI SMOOTHOUT TRENDS */}
          {chartType === 'heikin' && (
            <g>
              {heikinCandles.map((candle, idx) => {
                const candleWidth = Math.max(3, ((chartWidth - 60) / prices.length) * 0.65);
                const color = candle.isUp ? '#10b981' : '#f43f5e';
                
                return (
                  <g key={idx}>
                    {/* Wick Range */}
                    <line
                      x1={candle.x}
                      y1={candle.topWickY}
                      x2={candle.x}
                      y2={candle.bottomWickY}
                      stroke={color}
                      strokeWidth="1.2"
                    />
                    {/* Body */}
                    <rect
                      x={candle.x - candleWidth / 2}
                      y={candle.bodyTopY}
                      width={candleWidth}
                      height={candle.bodyHeight}
                      fill={color}
                      stroke={color}
                      strokeWidth="0.5"
                      rx="0.5"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* 5. OHLC BARS GRAPH */}
          {chartType === 'bars' && (
            <g>
              {candlesticks.map((bar, idx) => {
                const barWidth = Math.max(3, ((chartWidth - 60) / prices.length) * 0.5);
                const color = bar.isUp ? '#10b981' : '#f43f5e';
                const bodyBottom = bar.bodyTopY + bar.bodyHeight;
                
                return (
                  <g key={idx} className="opacity-90">
                    {/* Vertical range */}
                    <line
                      x1={bar.x}
                      y1={bar.topWickY}
                      x2={bar.x}
                      y2={bar.bottomWickY}
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    {/* Left tick (Open representation) */}
                    <line
                      x1={bar.x - barWidth}
                      y1={bar.isUp ? bodyBottom : bar.bodyTopY}
                      x2={bar.x}
                      y2={bar.isUp ? bodyBottom : bar.bodyTopY}
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    {/* Right tick (Close representation) */}
                    <line
                      x1={bar.x}
                      y1={bar.isUp ? bar.bodyTopY : bodyBottom}
                      x2={bar.x + barWidth}
                      y2={bar.isUp ? bar.bodyTopY : bodyBottom}
                      stroke={color}
                      strokeWidth="1.5"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* 6. SMA GOLDEN TREND LINE OVERLAY */}
          {showSMA && smaLinePath && (
            <path
              d={smaLinePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="opacity-90"
            />
          )}

          {/* 7. BLINKING PRICE TRACKER LEVEL LINE (QX EXACT EXECUTIONS STYLE) */}
          {currentPoint && (
            <g>
              <line
                x1="0"
                y1={currentPoint.y}
                x2={chartWidth - 60}
                y2={currentPoint.y}
                stroke={isLoss ? '#f43f5e' : '#10b981'}
                strokeWidth="1"
                strokeDasharray="2 2"
                className="animate-pulse"
              />
              
              {/* Glowing signal ripple dot at ending coordinate of timeline */}
              <circle
                cx={currentPoint.x}
                cy={currentPoint.y}
                r="3.5"
                fill={isLoss ? '#f43f5e' : '#10b981'}
                stroke="#ffffff"
                strokeWidth="1"
              />
              <circle
                cx={currentPoint.x}
                cy={currentPoint.y}
                r="7"
                fill="none"
                stroke={isLoss ? '#f43f5e' : '#10b981'}
                strokeWidth="1"
                className="animate-ping opacity-60"
              />

              {/* Glowing active quota tag on right side axis boundary */}
              <rect
                x={chartWidth - 56}
                y={currentPoint.y - 8}
                width="53"
                height="15"
                rx="3"
                fill={isLoss ? '#f43f5e' : '#10b981'}
                className="shadow-lg shadow-black"
              />
              <text
                x={chartWidth - 30}
                y={currentPoint.y + 2.5}
                fill="#000000"
                fontSize="8"
                fontWeight="900"
                textAnchor="middle"
                className="font-mono"
              >
                {currentPoint.price.toFixed(1)}
              </text>
            </g>
          )}

          {/* 8. RSI OSCILLATOR PANEL (Bottom) */}
          {showRSI && (
            <g>
              <rect
                x="0"
                y={rsiOffset}
                width={chartWidth - 60}
                height={rsiHeight}
                fill="#0a0a0c"
                stroke="#18181b"
                strokeWidth="0.8"
              />
              
              {/* RSI boundaries */}
              {/* Upper band (70) */}
              <line
                x1="0"
                y1={rsiOffset + (rsiHeight * 0.3)}
                x2={chartWidth - 60}
                y2={rsiOffset + (rsiHeight * 0.3)}
                stroke="#dc2626"
                strokeWidth="0.6"
                strokeOpacity="0.4"
                strokeDasharray="2 2"
              />
              <text x={chartWidth - 55} y={rsiOffset + (rsiHeight * 0.3) + 3} fill="#71717a" fontSize="7" className="font-mono">70 (Overbought)</text>

              {/* Center point line (50) */}
              <line
                x1="0"
                y1={rsiOffset + (rsiHeight * 0.5)}
                x2={chartWidth - 60}
                y2={rsiOffset + (rsiHeight * 0.5)}
                stroke="#52525b"
                strokeWidth="0.5"
                strokeDasharray="4 4"
                strokeOpacity="0.3"
              />

              {/* Lower band (30) */}
              <line
                x1="0"
                y1={rsiOffset + (rsiHeight * 0.7)}
                x2={chartWidth - 60}
                y2={rsiOffset + (rsiHeight * 0.7)}
                stroke="#2563eb"
                strokeWidth="0.6"
                strokeOpacity="0.4"
                strokeDasharray="2 2"
              />
              <text x={chartWidth - 55} y={rsiOffset + (rsiHeight * 0.7) + 3} fill="#71717a" fontSize="7" className="font-mono">30 (Oversold)</text>

              {/* Core RSI oscillator line */}
              {rsiLinePath && (
                <path
                  d={rsiLinePath}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              )}
              
              <text x="5" y={rsiOffset + 10} fill="#a855f7" fontSize="7" fontWeight="bold" className="font-mono uppercase opacity-75">
                RSI (14) OSCILADOR
              </text>
            </g>
          )}

          {/* 9. REAL-TIME SYSTEM COORDINATE TRACKER RETICLE ON MOUSE HOVER */}
          {mouseCoord && mouseCoord.x < (chartWidth - 60) && (
            <g>
              {/* Horizontal reticle wire */}
              <line
                x1="0"
                y1={mouseCoord.y}
                x2={chartWidth - 60}
                y2={mouseCoord.y}
                stroke="#71717a"
                strokeWidth="0.6"
                strokeDasharray="2 2"
                className="opacity-60"
              />
              {/* Vertical reticle wire */}
              <line
                x1={mouseCoord.x}
                y1="0"
                x2={mouseCoord.x}
                y2={totalSvgHeight}
                stroke="#71717a"
                strokeWidth="0.6"
                strokeDasharray="2 2"
                className="opacity-60"
              />
              {/* Intersect point dot */}
              <circle
                cx={mouseCoord.x}
                cy={mouseCoord.y}
                r="2"
                fill="#ffffff"
              />

              {/* Floating coordinate value display on Axis right margin */}
              {mouseCoord.y <= chartHeight && (
                <g>
                  <rect
                    x={chartWidth - 58}
                    y={mouseCoord.y - 7}
                    width="55"
                    height="14"
                    rx="2"
                    fill="#18181b"
                    stroke="#52525b"
                    strokeWidth="0.5"
                  />
                  <text
                    x={chartWidth - 30}
                    y={mouseCoord.y + 2}
                    fill="#f4f4f5"
                    fontSize="7"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {(maxPrice - (mouseCoord.y / chartHeight) * priceRange).toFixed(1)}
                  </text>
                </g>
              )}
            </g>
          )}
        </svg>

        {/* Empty history representation alert */}
        {prices.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 text-zinc-500 font-mono text-center">
            A aguardar resposta de transações via API...
          </div>
        )}
      </div>

      {/* Mini indicator alert system summary status */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded border border-zinc-900 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>Sinal de Força: </span>
            <span className="text-emerald-400 font-bold">FORTE COMPRA (82%)</span>
          </span>
          <span className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded border border-zinc-900 leading-none">
            <Activity size={10} className="text-amber-500" />
            <span>Alavancagem Máxima: 1:100</span>
          </span>
        </div>
        <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-650">
          <span>Escala de Preços auto-ajustada por volume</span>
        </div>
      </div>
    </div>
  );

  // Helper function to shift bounds easily based on dynamic offsets
  function chartYOffset(pos: number) {
    return chartHeight * pos;
  }
}

