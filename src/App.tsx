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
  const { currentUser, roleMode, activeAsset, activeView } = useTrading();
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // Listen to Firebase Auth state on mount or user change
    const unsubscribe = auth.onAuthStateChanged(async (fbUser) => {
      const isGeneralBypassed = localStorage.getItem('bypass_verif_general') === 'true';
      const isUserBypassed = currentUser ? localStorage.getItem('bypass_verif_' + currentUser.id) === 'true' : false;

      if (fbUser && !fbUser.isAnonymous) {
        try {
          await fbUser.reload();
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
            await fbUser.reload();
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
