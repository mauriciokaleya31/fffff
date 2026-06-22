import { useTrading } from '../context/TradingContext';
import { Shield, User, Wallet, LogOut, Code, Globe2, ArrowRightLeft, Receipt, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { formatKz } from '../utils';
import { playSound } from '../lib/audio';

export default function Navbar() {
  const { 
    currentUser, 
    roleMode, 
    setRoleMode, 
    switchDemoMode, 
    logout,
    platformConfig,
    activeView,
    setActiveView,
    walletTab,
    setWalletTab,
    onlineUsersCount
  } = useTrading();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(playSound.isEnabled());

  if (!currentUser) return null;

  const currentBalance = currentUser.isDemo ? currentUser.demoBalance : currentUser.balance;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-40">
      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left: Brand Identity & Nav buttons */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            {platformConfig.logoUrl ? (
              <img 
                src={platformConfig.logoUrl} 
                alt={platformConfig.logoText || "Logo"} 
                className="h-10 max-w-[200px] object-contain rounded"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-red-600 to-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20">
                  <span className="font-display font-bold text-lg text-white tracking-widest">
                    {(platformConfig.logoText || "K").substring(0, 1).toUpperCase()}
                  </span>
                </div>
                <span className="font-display font-bold text-lg tracking-tight text-white">
                  {platformConfig.logoText || "KzOption"}
                </span>
              </div>
            )}

            {/* Live Online Workers Indicator */}
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-emerald-500/10 px-2.5 py-1 rounded-full text-[10px] font-mono text-emerald-400 select-none shadow shadow-amber-950 animate-pulse ml-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{onlineUsersCount} online</span>
            </div>
          </div>

          {/* Center/Left: View Navigation tabs */}
          {roleMode === 'user' && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 self-start md:self-auto">
              <button
                id="nav-trade-btn"
                onClick={() => setActiveView('trade')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all ${
                  activeView === 'trade'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <ArrowRightLeft size={14} className="text-current" />
                Operar Cripto
              </button>
              <button
                id="nav-deposit-btn"
                onClick={() => {
                  setActiveView('wallet');
                  setWalletTab('deposit');
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all ${
                  activeView === 'wallet' && walletTab === 'deposit'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <Wallet size={14} className="text-emerald-500" />
                Depositar Kz
              </button>
              <button
                id="nav-withdraw-btn"
                onClick={() => {
                  setActiveView('wallet');
                  setWalletTab('withdraw');
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all ${
                  activeView === 'wallet' && walletTab === 'withdraw'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <LogOut size={14} className="rotate-180 text-rose-500 text-current" />
                Sacar / Levantar
              </button>
              <button
                id="nav-history-btn"
                onClick={() => {
                  setActiveView('wallet');
                  setWalletTab('history');
                }}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all ${
                  activeView === 'wallet' && walletTab === 'history'
                    ? 'bg-sky-600 text-white font-bold shadow-md shadow-sky-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <Receipt size={14} className="text-sky-400" />
                Historial
              </button>
            </div>
          )}
        </div>

        {/* Right: User Dashboard Controls & Simulation Toggles */}
        <div className="flex flex-wrap items-center gap-4">

          {/* Account Balance Display Picker */}
          {roleMode === 'user' && (
            <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 p-1">
              <button
                id="demo-mode-btn"
                onClick={() => switchDemoMode(true)}
                className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${
                  currentUser.isDemo 
                    ? 'bg-slate-800 text-amber-400 font-semibold' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Demonstração
              </button>
              <button
                id="live-mode-btn"
                onClick={() => switchDemoMode(false)}
                className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${
                  !currentUser.isDemo 
                    ? 'bg-emerald-600 text-white font-semibold shadow-sm shadow-emerald-900/' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Conta Real
              </button>
            </div>
          )}

          {/* Balance Tracker */}
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400">
              <Wallet size={16} className={currentUser.isDemo ? 'text-amber-400' : 'text-emerald-500'} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
                {currentUser.isDemo ? 'Saldo Demo' : 'Saldo Real'}
              </p>
              <p className={`font-mono font-bold text-sm ${currentUser.isDemo ? 'text-amber-400' : 'text-emerald-500'}`}>
                {formatKz(currentBalance)}
              </p>
            </div>
          </div>

          {/* User Persona Profile Detail */}
          <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
            <button
              id="nav-profile-btn"
              onClick={() => setActiveView('profile')}
              className={`text-right hover:opacity-80 transition-all flex flex-col items-end hidden sm:flex ${
                activeView === 'profile' ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-semibold ${
                  activeView === 'profile' ? 'text-amber-400' : 'text-white'
                }`}>{currentUser.name}</span>
                {currentUser.verificationStatus === 'APPROVED' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Verificado (Compliance OK)" />
                ) : currentUser.verificationStatus === 'PENDING' ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Em Análise de Compliance" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" title="Perfil por Verificar" />
                )}
              </div>
              <p className="text-[10px] font-mono text-slate-500 hover:underline">
                {activeView === 'profile' ? 'A ver Definições' : 'Editar Perfil / BI'}
              </p>
            </button>
            {currentUser.role === 'admin' && (
              <button
                id="toggle-admin-view-btn"
                onClick={() => setRoleMode(roleMode === 'admin' ? 'user' : 'admin')}
                className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                  roleMode === 'admin'
                    ? 'bg-rose-950/40 border-rose-800/60 text-rose-400 hover:bg-rose-900/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
                title={roleMode === 'admin' ? "Alternar para Vista Comercial" : "Alternar para Painel Principal"}
              >
                <Shield size={16} />
              </button>
            )}
            <button
              id="toggle-sound-btn"
              onClick={() => {
                if (isSoundEnabled) {
                  playSound.disable();
                  setIsSoundEnabled(false);
                } else {
                  playSound.enable();
                  playSound.tradeOpen();
                  setIsSoundEnabled(true);
                }
              }}
              className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all bg-slate-950 border-slate-800 ${
                isSoundEnabled
                  ? 'text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
                  : 'text-red-500/80 hover:text-red-400 border-red-500/20 bg-red-500/5'
              }`}
              title={isSoundEnabled ? "Desativar Sons da Plataforma" : "Ativar Sons da Plataforma"}
            >
              {isSoundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              id="logout-btn"
              onClick={logout}
              className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
              title="Terminar Sessão"
            >
              <LogOut size={16} />
            </button>
          </div>

        </div>

      </div>
    </nav>
  );
}
