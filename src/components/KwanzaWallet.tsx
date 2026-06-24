import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { Landmark, ArrowUpRight, ArrowDownRight, Send, Receipt, CheckCircle, AlertTriangle, Copy, FileText, Check, Upload, Mail } from 'lucide-react';
import { formatKz } from '../utils';

export default function KwanzaWallet() {
  const { 
    currentUser, 
    transactions, 
    requestDeposit, 
    requestWithdrawal, 
    platformConfig,
    walletTab,
    setWalletTab
  } = useTrading();
  
  // Deposit state
  const [depAmount, setDepAmount] = useState(10000);
  const [depMethod, setDepMethod] = useState('Transferência Multicaixa / IBAN');
  const [depIban, setDepIban] = useState('AO06.0000.0000.0000.0000.0000.0');
  const [targetBank, setTargetBank] = useState('Standard Bank S.A.');
  
  // New customized deposit state fields
  const [customEmail, setCustomEmail] = useState(currentUser?.email || '');
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileBase64, setProofFileBase64] = useState('');
  const [copiedEntidade, setCopiedEntidade] = useState(false);
  const [copiedReferencia, setCopiedReferencia] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Withdraw state
  const [withAmount, setWithAmount] = useState(5000);
  const [withMethod, setWithMethod] = useState('IBAN Bancário');
  const [withIban, setWithIban] = useState('AO06.0000.0000.0000.0000.0000.0');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentUser) return null;

  const handleCopy = (text: string, type: 'entidade' | 'referencia') => {
    navigator.clipboard.writeText(text);
    if (type === 'entidade') {
      setCopiedEntidade(true);
      setTimeout(() => setCopiedEntidade(false), 2000);
    } else {
      setCopiedReferencia(true);
      setTimeout(() => setCopiedReferencia(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'O ficheiro selecionado excede o tamanho máximo de 3 MB.' });
      return;
    }

    setProofFileName(file.name);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = () => {
      setProofFileBase64(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setMessage({ type: 'error', text: 'Erro ao ler o ficheiro.' });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (depAmount < 1000) {
      setMessage({ type: 'error', text: 'O valor mínimo para depósitos é de 1.000,00 Kz.' });
      return;
    }
    if (depAmount > 50000) {
      setMessage({ type: 'error', text: 'O valor máximo permitido por depósito é de 50.000,00 Kz.' });
      return;
    }
    if (!proofFileBase64) {
      setMessage({ type: 'error', text: 'Por favor, envie o comprovativo de pagamento.' });
      return;
    }
    
    // Send to Firestore
    requestDeposit(
      depAmount, 
      currentUser.email, 
      'Pagamento por Referência (Multicaixa)', 
      proofFileName, 
      proofFileBase64
    );

    setMessage({ 
      type: 'success', 
      text: `Obrigado! A sua solicitação de recarga de ${formatKz(depAmount)} foi recebida com sucesso. O valor será creditado após a validação do comprovativo.` 
    });
    
    // Redirect to history tab to show the pending deposit list
    setWalletTab('history');

    // reset form
    setDepAmount(10000);
    setProofFileName('');
    setProofFileBase64('');
    setTimeout(() => setMessage(null), 8000);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withAmount < 1000) {
      setMessage({ type: 'error', text: 'O valor mínimo para levantamentos é de 1.000,00 Kz.' });
      return;
    }

    // Calcular levantamentos do dia para garantir o limite diário de 10.000 Kz
    const today = new Date().toISOString().substring(0, 10);
    const userWithdrawalSum = transactions
      .filter(tx => tx.userId === currentUser.id && tx.type === 'WITHDRAW' && tx.date.startsWith(today) && tx.status !== 'REJECTED')
      .reduce((sum, tx) => sum + tx.amount, 0);

    if (userWithdrawalSum + withAmount > 10000) {
      setMessage({ 
        type: 'error', 
        text: `Limite diário máximo acumulado de 10.000,00 Kz excedido. Já retirou/solicitou ${formatKz(userWithdrawalSum)} hoje.` 
      });
      return;
    }

    const currentBalance = currentUser.isDemo ? currentUser.demoBalance : currentUser.balance;
    if (currentBalance < withAmount) {
      setMessage({ type: 'error', text: 'Saldo disponível insuficiente para efetuar este levantamento.' });
      return;
    }

    const success = requestWithdrawal(withAmount, withIban, withMethod);
    if (success) {
      setMessage({ 
        type: 'success', 
        text: `Pedido de levantamento de ${formatKz(withAmount)} enviado com sucesso!` 
      });
      setWithAmount(5000);
    } else {
      setMessage({ type: 'error', text: 'Não foi possível concluir o pedido de levantamento.' });
    }
    setTimeout(() => setMessage(null), 5000);
  };

  // Filter transactions owned by current user
  const userTransactions = transactions.filter(tx => tx.userId === currentUser.id);

  const getStatusBadge = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">Aprovado</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-[10px]">Rejeitado</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold text-[10px] animate-pulse">Pendente</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[750px]">
      
      {/* Wallet Tabs */}
      <div className="grid grid-cols-3 bg-slate-950/80 border-b border-slate-800 font-display">
        <button
          onClick={() => setWalletTab('deposit')}
          className={`py-3.5 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
            walletTab === 'deposit'
              ? 'border-amber-500 bg-slate-900/50 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight size={14} className="text-emerald-500" />
          Depositar
        </button>
        <button
          onClick={() => setWalletTab('withdraw')}
          className={`py-3.5 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
            walletTab === 'withdraw'
              ? 'border-amber-500 bg-slate-900/50 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownRight size={14} className="text-red-500" />
          Levantar
        </button>
        <button
          onClick={() => setWalletTab('history')}
          className={`py-3.5 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-all ${
            walletTab === 'history'
              ? 'border-amber-500 bg-slate-900/50 text-white'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Receipt size={14} className="text-sky-500" />
          Historial
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        {message && (
          <div className={`p-4 rounded-xl text-xs font-medium mb-5 flex gap-2 items-center ${
            message.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
              : 'bg-red-500/10 text-red-500 border border-red-500/25'
          }`}>
            {message.type === 'success' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
            <span>{message.text}</span>
          </div>
        )}

        {currentUser.isDemo && walletTab !== 'history' && (
          <div className="bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs p-3.5 rounded-xl mb-5 flex gap-2.5 items-start">
            <AlertTriangle className="shrink-0 mt-0.5 text-amber-500" size={15} />
            <div>
              <p className="font-semibold">Modo de Simulação Ativo</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Está atualmente no Modo de Demonstração. Mude para a **Conta Real** na barra superior se quiser testar depósitos e levantamentos persistentes aplicados na sua carteira.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: DEPOSIT FROM MULTICAIXA OR LOCAL WATERFALL */}
        {walletTab === 'deposit' && (
          <form onSubmit={handleDepositSubmit} className="space-y-4 text-slate-300">
            {/* Instruções de carregamento */}
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-4 space-y-2.5">
              <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-amber-500">
                Instruções de carregamento
              </h4>
              <ol className="text-[11px] space-y-1.5 list-decimal list-inside text-slate-400 font-medium">
                <li>Abra o aplicativo <span className="text-white font-semibold">Multicaixa Express</span>.</li>
                <li>Copie os dados fornecidos abaixo.</li>
                <li>Conclua o pagamento do valor.</li>
                <li>Envie o comprovativo apenas em <span className="text-white font-semibold">PDF ou Foto</span>.</li>
                <li>Aguarde de <span className="text-amber-400 font-semibold">5 a 10 minutos</span> para confirmação.</li>
              </ol>
            </div>

            {/* Valor para carregar */}
            <div>
              <div className="flex justify-between items-center mb-1.5 gap-1.5 flex-wrap">
                <label htmlFor="deposit-amount" className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  Valor para carregar
                </label>
                <span className="text-[9px] text-slate-500 font-mono">
                  Limites: 1.000 Kz - 50.000 Kz
                </span>
              </div>
              <div className="relative">
                <input
                  id="deposit-amount"
                  type="number"
                  min="1000"
                  max="50000"
                  step="500"
                  value={depAmount}
                  onChange={(e) => setDepAmount(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 pr-10 text-xs font-mono text-white focus:outline-none focus:border-amber-500 placeholder-slate-650"
                  placeholder="Digite o valor em Kz"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold font-mono text-slate-500">
                  Kz
                </span>
              </div>
            </div>

            {/* Dados de Referência */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 block">
                Pagamento por Referência
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {/* Entidade */}
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Entidade</p>
                    <p className="text-white font-black text-sm mt-0.5">00930</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('00930', 'entidade')}
                    className="p-1.5 rounded-md bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5 text-[9px] font-sans font-bold"
                  >
                    {copiedEntidade ? (
                      <>
                        <Check size={11} className="text-emerald-500" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Referência */}
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Referência</p>
                    <p className="text-white font-black text-sm mt-0.5">929852534</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('929852534', 'referencia')}
                    className="p-1.5 rounded-md bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer flex items-center gap-1.5 text-[9px] font-sans font-bold"
                  >
                    {copiedReferencia ? (
                      <>
                        <Check size={11} className="text-emerald-500" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Comprovativo de Pagamento */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
                Comprovativo de Pagamento
              </label>
              
              <div className="border border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 rounded-xl p-4 text-center relative transition-all">
                <input
                  id="proof-upload"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                  {proofFileName ? (
                    <>
                      <FileText size={24} className="text-amber-500 animate-bounce" />
                      <p className="text-xs text-white font-mono font-bold truncate max-w-xs">{proofFileName}</p>
                      <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                        <Check size={12} /> Ficheiro carregado com sucesso
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload size={22} className="text-slate-500" />
                      <p className="text-xs text-slate-300 font-semibold">Envie apenas arquivos PDF ou Imagem</p>
                      <p className="text-[9px] text-slate-500 font-medium">Arraste ou clique para selecionar (máx. 3 MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="submit-deposit-btn"
              type="submit"
              disabled={isUploading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-display font-black py-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-lg active:translate-y-0.5 transition-all mt-4 cursor-pointer"
            >
              <Send size={14} />
              {isUploading ? 'A ler ficheiro...' : 'Enviar Solicitação'}
            </button>
          </form>
        )}

        {/* TAB 2: REQUEST WITHDRAWAL TO ANGOLA LOCAL ACCOUNTS */}
        {walletTab === 'withdraw' && (
          <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
            <h4 className="font-display font-bold text-sm text-white mb-2">Solicitar Levantamento de Fundos</h4>
            <p className="text-xs text-slate-400 mb-4">
              Os fundos levantados serão deduzidos do seu saldo imediatamente e enviados por transferência bancária para a conta indicada em até 24 horas úteis.
            </p>

            <div>
              <div className="flex justify-between items-center mb-1.5 gap-1.5 flex-wrap sm:flex-nowrap">
                <label htmlFor="withdraw-amount" className="text-[10px] text-slate-500 uppercase tracking-wider font-bold whitespace-nowrap">
                  Valor para Levantar
                </label>
                <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap">
                  Limites: 1.000 Kz - 10.000 Kz
                </span>
              </div>
              <input
                id="withdraw-amount"
                type="number"
                min="1000"
                max="10000"
                step="500"
                value={withAmount}
                onChange={(e) => setWithAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
                O Seu IBAN de Cadastro (21 dígitos)
              </label>
              <input
                id="withdraw-iban"
                type="text"
                value={withIban}
                onChange={(e) => setWithIban(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="XX06.0000.0000.1234.5678.9101.1"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
                Canal de Destino
              </label>
              <select
                id="withdraw-channel-select"
                value={withMethod}
                onChange={(e) => setWithMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Transferência de Crédito">Transferência por IBAN Bancário</option>
                <option value="Multicaixa Express Direto">Telemóvel associado ao Express</option>
                <option value="Levantamento Sem Cartão">MCX Levantamento por Código</option>
              </select>
            </div>

            <button
              id="submit-withdrawal-btn"
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-lg active:translate-y-0.5 transition-all mt-3"
            >
              <Send size={14} />
              Solicitar Levantamento Instantâneo
            </button>
          </form>
        )}

        {/* TAB 3: HISTORICAL TRANSACTIONS FLOW */}
        {walletTab === 'history' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-display font-bold text-sm text-white">Carteira & Transações</h4>
              <span className="font-mono text-[9px] text-slate-500">Historial de Finanças</span>
            </div>

            {userTransactions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Ainda não efetuou transações de carteira.
              </div>
            ) : (
              <div className="space-y-2.5">
                {userTransactions.map(tx => {
                  const isDep = tx.type === 'DEPOSIT';
                  return (
                    <div key={tx.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isDep ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="text-xs font-semibold text-white">
                            {isDep ? 'Depósito Realizado' : 'Levantamento Retirado'}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-1 font-mono">
                          Canal: {tx.paymentMethod} • Ref: {tx.proofNumber || 'PROCESSANDO'}
                        </p>
                        <p className="text-[9px] text-slate-500 font-mono">
                          Data: {new Date(tx.date).toLocaleString('pt-AO')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 border-slate-900 pt-2 sm:pt-0">
                        <span className={`font-mono text-xs font-bold ${isDep ? 'text-emerald-500' : 'text-red-400'}`}>
                          {isDep ? '+' : '-'}{formatKz(tx.amount)}
                        </span>
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer footer wallet info */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-500 text-center flex justify-between items-center px-5">
        <span className="flex items-center gap-1 font-semibold text-amber-500">
          <Landmark size={12} />
          Bancos Parceiros Suportados
        </span>
        <span className="text-slate-500 font-mono">Transferência 24/7</span>
      </div>
    </div>
  );
}
