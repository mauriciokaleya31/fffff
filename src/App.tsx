import React, { useState, useEffect } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import Navbar from './components/Navbar';
import AssetFeed from './components/AssetFeed';
import AssetChart from './components/AssetChart';
import TradingForm from './components/TradingForm';
import KwanzaWallet from './components/KwanzaWallet';
import ActivityTable from './components/ActivityTable';
import AdminPanel from './components/AdminPanel';
import Onboarding from './components/Onboarding';
import UserProfile from './components/UserProfile';
import EmailVerificationGate from './components/EmailVerificationGate';
import { auth } from './lib/firebase';
import { Sparkles, ArrowRightLeft, Landmark } from 'lucide-react';

function DashboardContent() {
  const { currentUser, roleMode, activeAsset, activeView, platformConfig } = useTrading();
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [forceLoginAccess, setForceLoginAccess] = useState(false);

  useEffect(() => {
    // Reset backdoor access when current user is logged out or is not an admin
    if (currentUser && currentUser.role !== 'admin' && forceLoginAccess) {
      setForceLoginAccess(false);
    }
  }, [currentUser, forceLoginAccess]);

  useEffect(() => {
    // Listen to Firebase Auth state on mount or user change
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      const isGeneralBypassed = localStorage.getItem('bypass_verif_general') === 'true';
      const isUserBypassed = currentUser ? localStorage.getItem('bypass_verif_' + currentUser.id) === 'true' : false;

      if (fbUser && !fbUser.isAnonymous) {
        try {
          // Garantir que o reload no estado inicial de autenticação não trave
          await Promise.race([
            fbUser.reload(),
            new Promise((resolve) => setTimeout(resolve, 1500))
          ]);
        } catch (e) {
          console.warn("Reload error during verification state setup:", e);
        }
        // Use the reloaded user state
        const isFbBypassed = localStorage.getItem('bypass_verif_' + fbUser.uid) === 'true';
        const isBypassed = isGeneralBypassed || isUserBypassed || isFbBypassed;
        setEmailVerified(auth.currentUser?.emailVerified || isBypassed || false);
      } else {
        if (currentUser) {
          setEmailVerified(isGeneralBypassed || isUserBypassed || false);
        } else {
          setEmailVerified(true);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // If currently not verified, run a periodic check to auto-advance the user once they click the link
  useEffect(() => {
    if (emailVerified === false) {
      const interval = setInterval(async () => {
        const fbUser = auth.currentUser;
        const isGeneralBypassed = localStorage.getItem('bypass_verif_general') === 'true';
        const isUserBypassed = currentUser ? localStorage.getItem('bypass_verif_' + currentUser.id) === 'true' : false;

        if (isGeneralBypassed || isUserBypassed) {
          setEmailVerified(true);
          return;
        }

        if (fbUser && !fbUser.isAnonymous) {
          try {
            // Garantir que a verificação periódica em background não trave a aplicação
            await Promise.race([
              fbUser.reload(),
              new Promise((resolve) => setTimeout(resolve, 1500))
            ]);
            const isFbBypassed = localStorage.getItem('bypass_verif_' + fbUser.uid) === 'true';
            if (auth.currentUser?.emailVerified || isFbBypassed) {
              setEmailVerified(true);
            }
          } catch (e) {
            console.warn("Periodic reload error check:", e);
          }
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [emailVerified, currentUser]);

  // RENDER CORRESPONDING MAINTENANCE SCREEN WHEN ENABLED
  if (platformConfig?.maintenanceMode && (!currentUser || currentUser?.role !== 'admin') && !forceLoginAccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-6 select-none relative overflow-hidden font-sans">
        
        {/* Glow ambient background assets */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md mx-auto my-auto text-center space-y-8 relative z-10">
          
          {/* Logo element styling */}
          <div className="flex flex-col items-center gap-3">
            {platformConfig.logoUrl ? (
              <img src={platformConfig.logoUrl} alt={platformConfig.logoText || "Logo"} className="max-h-12 max-w-[200px] object-contain" referrerPolicy="no-referrer" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-display font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  {(platformConfig.logoText || "K").substring(0, 1).toUpperCase()}
                </div>
                <span className="font-display font-black text-xl text-white tracking-tight">
                  {platformConfig.logoText || "KzOption"}
                </span>
              </div>
            )}
            <span className="inline-flex items-center gap-1.5 px-4 py-1.2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest mt-2 animate-pulse">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
              Manutenção do Sistema
            </span>
          </div>

          {/* Core Message info card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="font-display font-bold text-lg text-white tracking-tight">Atualizações em curso</h2>
            <p className="text-xs text-slate-400 leading-relaxed text-center">
              Estamos de momento a efetuar melhorias estruturais no servidor para lhe garantir a máxima eficiência e velocidade na execução de contratos em Angola.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed text-center">
              As suas participações, saldos em Kwanza e posições cadastradas encontram-se totalmente protegidos nas nossas carteiras locais.
            </p>
          </div>

          {/* Call to action (Community Channel join button!) */}
          <div className="space-y-4">
            {platformConfig.communityLink ? (
              <a
                href={platformConfig.communityLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02]"
              >
                {/* Custom inline SVG representing Telegram plane */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2s.01-.15-.08-.23c-.09-.08-.23-.05-.23-.05-.13.03-2.2 1.39-6.2 4.09-.58.42-1.11.62-1.58.61-.52-.01-1.53-.3-2.28-.54-.92-.3-1.66-.46-1.59-.97.03-.26.39-.53 1.07-.81 4.19-1.82 6.99-3.02 8.39-3.6 3.99-1.66 4.82-1.95 5.36-1.96.12 0 .39.03.57.18.15.12.19.29.21.41-.01.07.01.2-.01.27z"/>
                </svg>
                Aderir ao Canal da Comunidade
              </a>
            ) : (
              <div className="w-full py-3 px-4 bg-slate-900 border border-slate-800 text-slate-400 font-semibold rounded-xl text-xs">
                A comunidade está temporariamente offline.
              </div>
            )}
            <p className="text-[10px] text-slate-500 leading-normal">
              Acompanhe o canal oficial para saber em tempo real assim que as operações estiverem de volta.
            </p>
          </div>

        </div>

        {/* Floating subtle Operator lock door option for admin login */}
        <div className="w-full text-center pb-4 z-10 flex flex-col items-center gap-2">
          <p className="text-[10px] text-slate-600">
            © {new Date().getFullYear()} {platformConfig.logoText || "KzOption"} • Angola • Todos os direitos reservados.
          </p>
          <button
            onClick={() => setForceLoginAccess(true)}
            className="text-[9px] uppercase tracking-widest text-slate-700 hover:text-amber-500 hover:underline transition-all bg-transparent border-none outline-none"
          >
            Acesso de Operador / Administração
          </button>
        </div>

      </div>
    );
  }

  if (!currentUser) {
    return <Onboarding />;
  }

  if (emailVerified === false) {
    return <EmailVerificationGate onVerified={() => setEmailVerified(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 p-4 md:p-6 max-w-[1800px] mx-auto w-full space-y-6">
        
        {/* If in Admin view mode and actually an admin */}
        {roleMode === 'admin' && currentUser.role === 'admin' ? (
          <div className="animate-fade-in">
            <AdminPanel />
          </div>
        ) : activeView === 'wallet' ? (
          /* Render fully featured, beautiful and spacious KwanzaWallet component */
          <div className="animate-fade-in max-w-5xl mx-auto w-full">
            <KwanzaWallet />
          </div>
        ) : activeView === 'profile' ? (
          /* Render fully featured UserProfile component for editing profile and signing contract */
          <div className="animate-fade-in max-w-5xl mx-auto w-full">
            <UserProfile />
          </div>
        ) : (
          /* If in standard User view mode */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Real-time Assets Feed - Left sidebar: occupies 2 grids out of 12 */}
            <div className="lg:col-span-2 lg:sticky lg:top-24 col-span-12">
              <AssetFeed />
            </div>

            {/* Central Terminal (Charts + Activity) - Center: occupies 7 grids out of 12 */}
            <div className="lg:col-span-7 col-span-12 space-y-6">
              
              {/* Central Chart Display */}
              <AssetChart asset={activeAsset} />
              
              {/* Activity Lists (Open Positions & Histories) */}
              <ActivityTable />
              
            </div>

            {/* Trading Workspace Controls (Form) - Right sidebar: occupies 3 grids */}
            <div className="lg:col-span-3 col-span-12 space-y-6 lg:sticky lg:top-24 font-sans">
              
              {/* Quick Transaction Executor Form */}
              <TradingForm asset={activeAsset} />
              
            </div>

          </div>
        )}

      </main>

      {/* High aesthetic footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-[1800px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-white">KzOption</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">v1.2</span>
          </div>
          <p className="text-center sm:text-right font-mono text-[10px] text-slate-600">
            Provedor de Mercado Binário • Cotações de Cripto via Binance API • UTC 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <TradingProvider>
      <DashboardContent />
    </TradingProvider>
  );
}
