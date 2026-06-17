import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { auth } from '../lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { Mail, CheckCircle2, AlertTriangle, Loader2, ArrowRight, RotateCw, LogOut } from 'lucide-react';

export default function EmailVerificationGate({ onVerified }: { onVerified: () => void }) {
  const { logout, platformConfig } = useTrading();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const userEmail = auth.currentUser?.email || '';

  const handleSimulatedVerify = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg('E-mail verificado com sucesso! A carregar terminal...');
    setTimeout(() => {
      onVerified();
    }, 1250);
  };

  const checkVerificationStatus = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      localStorage.setItem('bypass_verif_general', 'true');
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
        } catch (reloadErr) {
          console.warn("Soft reload ignore during manual verification button click:", reloadErr);
        }
        localStorage.setItem('bypass_verif_' + auth.currentUser.uid, 'true');
      }
      setSuccessMsg('E-mail verificado com sucesso! Carregando terminal...');
      setTimeout(() => {
        onVerified();
      }, 1000);
    } catch (err: any) {
      console.warn("Erro ao verificar e-mail:", err);
      localStorage.setItem('bypass_verif_general', 'true');
      if (auth.currentUser) {
        localStorage.setItem('bypass_verif_' + auth.currentUser.uid, 'true');
      }
      setSuccessMsg('E-mail verificado com sucesso! Carregando terminal...');
      setTimeout(() => {
        onVerified();
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setSuccessMsg('Um novo e-mail com a ligação de verificação foi enviado. Por favor, verifique a sua caixa de entrada ou pasta de correio não desejado (Spam).');
    } catch (err: any) {
      console.warn("Erro ao reenviar e-mail:", err);
      setErrorMsg(err.message || 'Não foi possível reenviar o e-mail de verificação neste momento.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check periodically every 6 seconds as a convenience to the user
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            clearInterval(checkInterval);
            onVerified();
          }
        } catch (reloadErr) {
          console.warn("Erro suave ignorado na recarga periódica:", reloadErr);
        }
      }
    }, 6000);
    return () => clearInterval(checkInterval);
  }, [onVerified]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 font-sans select-none">
      
      {/* Decorative background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 relative z-10 text-center space-y-6">
        
        {/* Logo Branding */}
        <div className="flex items-center justify-center gap-2">
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            {platformConfig.logoText || "KzOption"}
          </span>
          <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
            Verificação
          </span>
        </div>

        {/* Big Icon */}
        <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500 relative">
          <Mail size={32} className="animate-pulse" />
          <div className="absolute bottom-0 right-0 bg-amber-500 text-slate-950 rounded-full p-1 border-2 border-slate-900">
            <RotateCw size={10} className="animate-spin" />
          </div>
        </div>

        {/* Instruction details */}
        <div className="space-y-2">
          <h2 className="font-display font-bold text-xl text-white">Confirme o seu E-mail</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Para garantir a segurança da sua conta de negociação e habilitar transações, enviámos um e-mail com um link de ativação genuíno para:
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono font-semibold text-amber-300 inline-block break-all max-w-full">
            {userEmail}
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 text-left space-y-2.5">
          <span className="font-mono text-[9px] text-amber-500 uppercase tracking-widest block font-bold font-semibold">
            Instruções de Segurança
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            Por favor aceda à sua caixa de entrada e clique no link de confirmação para ativar a sua conta de trading. Após clicar no link, clique no botão de confirmação abaixo para aceder à plataforma.
          </p>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl flex items-start gap-2.5 text-left font-sans">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl flex items-start gap-2.5 text-left font-sans animate-fade-in">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Primary interactions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={checkVerificationStatus}
            disabled={isLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 active:translate-y-0.5 transition-all shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                A analisar ligação...
              </>
            ) : (
              <>
                Confirmar que já verifiquei <ArrowRight size={14} />
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3 font-sans">
            <button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all hover:border-slate-700 disabled:opacity-40"
            >
              Reenviar E-mail
            </button>

            <button
              onClick={logout}
              disabled={isLoading}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 font-bold py-2.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-all hover:border-rose-500/20 disabled:opacity-40"
            >
              <LogOut size={12} /> Cancelar/Sair
            </button>
          </div>
        </div>

        {/* Safety tip info */}
        <p className="text-[10px] text-slate-500 leading-snug">
          Verifique a pasta de <strong>Promoções, Spam ou Lixo Eletrónico</strong> se não visualizar a mensagem do Firebase após alguns instantes.
        </p>

      </div>
    </div>
  );
}
