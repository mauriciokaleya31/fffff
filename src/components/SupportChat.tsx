import React, { useState, useEffect, useRef } from 'react';
import { useTrading } from '../context/TradingContext';
import { MessageCircle, X, Send, Clock, Lock, Shield, User, Volume2, VolumeX } from 'lucide-react';
import { playSound } from '../lib/audio';

export default function SupportChat() {
  const { currentUser, supportMessages, sendSupportMessage, platformConfig } = useTrading();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  if (!currentUser || currentUser.role === 'admin') return null;

  // Filter messages that belong strictly to this user's support thread
  const userMessages = supportMessages.filter(m => m.userId === currentUser.id);

  // Check if chat is open based on schedule configuration
  const checkIfOpen = () => {
    const forceStatus = platformConfig.supportStatusForce ?? 'AUTO';
    if (forceStatus === 'OPEN') return true;
    if (forceStatus === 'CLOSED') return false;

    try {
      const openStr = platformConfig.supportOpenHour ?? '08:00';
      const closeStr = platformConfig.supportCloseHour ?? '18:00';
      
      const [openH, openM] = openStr.split(':').map(Number);
      const [closeH, closeM] = closeStr.split(':').map(Number);
      
      // Get current hours and minutes relative to target
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      
      const openMin = openH * 60 + openM;
      const closeMin = closeH * 60 + closeM;
      const currentMin = currentH * 60 + currentM;
      
      return currentMin >= openMin && currentMin <= closeMin;
    } catch (e) {
      return true; // safe fallback
    }
  };

  const isServiceOpen = checkIfOpen();

  // Scroll to bottom on new message or when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      setUnreadCount(0);
    }
  }, [isOpen, userMessages.length]);

  // Track unread messages sent by admin when chat box is closed
  const prevLengthRef = useRef(userMessages.length);
  useEffect(() => {
    if (!isOpen && userMessages.length > prevLengthRef.current) {
      const lastMsg = userMessages[userMessages.length - 1];
      if (lastMsg && lastMsg.senderId !== currentUser.id) {
        setUnreadCount(prev => prev + 1);
      }
    }
    prevLengthRef.current = userMessages.length;
  }, [userMessages, isOpen, currentUser.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !isServiceOpen) return;

    const textToSend = inputMessage;
    setInputMessage('');
    await sendSupportMessage(textToSend);
    
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* 1. FLOATING CHAT TRIGGER BUTTON */}
      {!isOpen && (
        <button
          id="support-chat-trigger"
          onClick={() => setIsOpen(true)}
          className="relative group w-14 h-14 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all transform hover:scale-110 active:scale-95 duration-300"
          title="Fale Connosco / Suporte"
        >
          <MessageCircle size={26} className="text-slate-950" />
          
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-slate-950 animate-pulse">
              {unreadCount}
            </span>
          )}

          {/* Tooltip hint info */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 bg-slate-900 border border-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl transition-all pointer-events-none">
            Suporte KzOption
          </span>
        </button>
      )}

      {/* 2. SLATE CHAT PANEL WINDOW */}
      {isOpen && (
        <div id="support-chat-window" className="chat-window-fade-in w-80 md:w-96 h-[480px] bg-slate-900/98 backdrop-blur border border-slate-800 rounded-2xl flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Header section with status lamp */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-500">
                  <Shield size={18} />
                </div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                  isServiceOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`} />
              </div>
              
              <div>
                <h4 className="font-display font-bold text-xs text-white">Suporte Técnico</h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  {isServiceOpen ? 'Atendimento Online' : 'Suporte Indisponível'}
                </p>
              </div>
            </div>

            <button
              id="close-chat-btn"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Operational Hours Ribbon */}
          <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Clock size={11} /> Horário: {platformConfig.supportOpenHour ?? '08:00'} - {platformConfig.supportCloseHour ?? '18:00'}
            </span>
            <span>Atendimento AOA</span>
          </div>

          {/* Chat Messages flow body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/20">
            {userMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                <MessageCircle size={32} className="text-slate-800 animate-pulse" />
                <p className="text-[11px] leading-relaxed max-w-[220px]">
                  Olá! Como podemos ajudar nas suas operações hoje? Envie uma mensagem no chat para iniciar o atendimento.
                </p>
              </div>
            ) : (
              userMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs ${
                      isMe 
                        ? 'bg-amber-500 text-slate-950 rounded-tr-none' 
                        : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
                    }`}>
                      <div className="flex items-center gap-1 mb-0.5 justify-between">
                        <span className={`text-[9px] font-bold ${isMe ? 'text-slate-900' : 'text-amber-400'}`}>
                          {isMe ? 'Você' : 'Suporte'}
                        </span>
                        <span className="text-[8px] opacity-60 font-mono scale-90">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed select-text font-sans">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Message Input form */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            {isServiceOpen ? (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  id="chat-input-text"
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escreva a sua mensagem..."
                  className="flex-1 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all placeholder-slate-600 font-sans"
                  maxLength={500}
                />
                <button
                  id="send-chat-message-btn"
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="w-9 h-9 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-xl flex items-center justify-center transition-colors shadow-lg active:scale-95 duration-200"
                >
                  <Send size={14} />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-center">
                <Lock size={13} className="text-red-400 shrink-0" />
                <p className="text-[10px] text-red-400 text-left font-sans">
                  Suporte fora de serviço. Horário de funcionamento: das {platformConfig.supportOpenHour ?? '08:00'} às {platformConfig.supportCloseHour ?? '18:00'}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
