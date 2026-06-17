import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { Landmark, ArrowUpRight, ArrowDownRight, Send, Receipt, CheckCircle, AlertTriangle } from 'lucide-react';
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
  
  // Withdraw state
  const [withAmount, setWithAmount] = useState(5000);
  const [withMethod, setWithMethod] = useState('IBAN Bancário');
  const [withIban, setWithIban] = useState('AO06.0000.0000.0000.0000.0000.0');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentUser) return null;

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
    
    requestDeposit(depAmount, depIban, `${depMethod} (${targetBank})`);
    setMessage({ 
      type: 'success', 
      text: `Pedido de depósito de ${formatKz(depAmount)} enviado! Aguarde aprovação do Admin.` 
    });
    
    // reset form
    setDepAmount(10000);
    setTimeout(() => setMessage(null), 5000);
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
          Carteira
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
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <h4 className="font-display font-bold text-sm text-white mb-2">Simular Depósito de Kwanzas</h4>
            <p className="text-xs text-slate-400 mb-4">
              Transfira para as contas parceiras da KzOption e anexe o número do comprovativo para processamento imediato pelo administrador.
            </p>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
                Valor para Transferência (Mínimo: 1.000 Kz / Máximo: 50.000 Kz)
              </label>
              <input
                id="deposit-amount"
                type="number"
                min="1000"
                max="50000"
                step="500"
                value={depAmount}
                onChange={(e) => setDepAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
                Banco de Destino ({platformConfig.logoText || "KzOption"} Partner)
              </label>
              <select
                id="deposit-bank-select"
                value={targetBank}
                onChange={(e) => setTargetBank(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Standard Bank">Standard Bank S.A.</option>
                <option value="Sol Bank">Sol Bank & Investimentos</option>
                <option value="Comercial">Banco Comercial Internacional</option>
                <option value="Digital">Kz Digital Wallet Partner</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
                Método de Depósito Utilizado
              </label>
              <select
                id="deposit-method-select"
                value={depMethod}
                onChange={(e) => setDepMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Transferência Multicaixa">Transferência Multicaixa (ATM)</option>
                <option value="Multicaixa Express">Multicaixa Express (Telemóvel)</option>
                <option value="Depósito ao Balcão">Depósito Direto ao Balcão</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
                O Seu IBAN ou Telefone para Verificação
              </label>
              <input
                id="deposit-iban"
                type="text"
                value={depIban}
                onChange={(e) => setDepIban(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-4 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                placeholder="AO06.0000.0000.0000.0000.0000.0"
                required
              />
            </div>

            <button
              id="submit-deposit-btn"
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-lg active:translate-y-0.5 transition-all mt-3"
            >
              <Send size={14} />
              Enviar Comprovativo de Depósito
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
              <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1.5">
                Valor do Levantamento (Mínimo: 1.000,00 Kz / Limite Máximo Diário: 10.000,00 Kz)
              </label>
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
