import React, { useState, useRef, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { VerificationData } from '../types';
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Upload, 
  Eraser, 
  Edit3, 
  BadgeHelp,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';

export default function UserProfile() {
  const { 
    currentUser, 
    updateProfileBasicData, 
    submitVerification,
    setActiveView
  } = useTrading();

  if (!currentUser) return null;

  // Initialize fields from currentUser's verificationData if available
  const existingData = currentUser.verificationData;
  
  const [firstName, setFirstName] = useState(existingData?.firstName || '');
  const [lastName, setLastName] = useState(existingData?.lastName || '');
  const [birthDate, setBirthDate] = useState(existingData?.birthDate || '');
  const [location, setLocation] = useState(existingData?.location || '');
  const [contactNumber, setContactNumber] = useState(existingData?.contactNumber || '');

  // File states (Base64 dataURLs)
  const [biFront, setBiFront] = useState(existingData?.biFrontUrl || '');
  const [biBack, setBiBack] = useState(existingData?.biBackUrl || '');
  const [selfieWithBi, setSelfieWithBi] = useState(existingData?.selfieWithBiUrl || '');
  const [signature, setSignature] = useState(existingData?.signatureDataUrl || '');

  // UI state
  const [isDrawing, setIsDrawing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeStep, setActiveStep] = useState(1); // 1: Personal Data, 2: Document Uploads, 3: Sign Contract

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Set up Canvas for drawing signature
  useEffect(() => {
    if (activeStep === 3 && canvasRef.current) {
      const canvas = canvasRef.current;
      // High DPI scaling
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = '#f59e0b'; // Amber yellow matching trading theme
        context.lineWidth = 3;
        contextRef.current = context;
      }
    }
  }, [activeStep]);

  // Start Drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!contextRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  // Draw Line
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    if (e.cancelable) e.preventDefault(); // Stop scrolling on touch
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  // Stop Drawing
  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    
    // Save drawn signature to state
    if (canvasRef.current) {
      const base64Url = canvasRef.current.toDataURL('image/png');
      setSignature(base64Url);
    }
  };

  // Clear signature canvas
  const clearSignature = () => {
    if (!canvasRef.current || !contextRef.current) return;
    const canvas = canvasRef.current;
    const context = contextRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  // Load image files and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setter(reader.result);
        }
      };
      reader.onerror = () => {
        setErrorMsg('Erro ao ler o ficheiro. Tente um formato JPEG/PNG diferente.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle saving basic profile details
  const saveBasicDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !birthDate || !location || !contactNumber) {
      setErrorMsg('Por favor preencha todos os dados básicos obrigatórios.');
      return;
    }
    updateProfileBasicData({
      firstName,
      lastName,
      birthDate,
      location,
      contactNumber
    });
    setSuccessMsg('Dados básicos salvos com sucesso!');
    setErrorMsg('');
    setTimeout(() => setSuccessMsg(''), 3000);
    setActiveStep(2); // Go to uploads
  };

  // Handle submit verification
  const handleVerificationSubmit = () => {
    if (!firstName || !lastName || !birthDate || !location || !contactNumber) {
      setErrorMsg('Falta preencher os seus dados pessoais básicos na Etapa 1.');
      setActiveStep(1);
      return;
    }
    if (!biFront || !biBack || !selfieWithBi) {
      setErrorMsg('Por favor forneça imagens da Frente do BI, Verso do BI e uma Selfie com o BI.');
      setActiveStep(2);
      return;
    }
    if (!signature) {
      setErrorMsg('Por favor, assine digitalmente o contrato no ecrã para prosseguir.');
      setActiveStep(3);
      return;
    }

    submitVerification({
      firstName,
      lastName,
      birthDate,
      location,
      contactNumber,
      biFrontUrl: biFront,
      biBackUrl: biBack,
      selfieWithBiUrl: selfieWithBi,
      signatureDataUrl: signature
    });

    setErrorMsg('');
    setSuccessMsg('Pedido de verificação e contrato submetidos com sucesso ao departamento de Compliance!');
    setActiveStep(1);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 p-6 md:p-8 space-y-8 max-w-4xl mx-auto shadow-2xl">
      
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setActiveView('trade')}
            className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-all text-slate-400 hover:text-white shrink-0"
            title="Voltar ao Trade"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-display font-medium text-white flex items-center gap-2 truncate">
              Configurações de Perfil
            </h1>
            <p className="text-xs text-slate-400 truncate">Verifique a sua identidade jurídica e configure os seus dados em Angola</p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
            className="sm:hidden p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all shrink-0"
            title="Abrir Chat de Suporte"
          >
            <MessageCircle size={16} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto sm:justify-end">
          {/* Support Chat Fast Trigger */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-semibold cursor-pointer shadow-sm"
            title="Abrir Chat de Suporte Técnico"
          >
            <MessageCircle size={14} className="text-amber-500" />
            <span>Suporte Técnico</span>
          </button>

          {/* Dynamic Status Badge */}
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-medium">Estado:</p>
            {currentUser.verificationStatus === 'APPROVED' && (
              <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
                <ShieldCheck size={14} />
                Verificado (Compliance OK)
              </span>
            )}
            {currentUser.verificationStatus === 'PENDING' && (
              <span className="flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-amber-500/20 animate-pulse">
                <Clock size={14} />
                Em Análise de Compliance
              </span>
            )}
            {currentUser.verificationStatus === 'REJECTED' && (
              <span className="flex items-center gap-1 bg-red-500/10 text-red-500 text-xs px-2.5 py-1 rounded-full font-semibold border border-red-500/20">
                <AlertTriangle size={14} />
                Rejeitado / Pendente Correção
              </span>
            )}
            {currentUser.verificationStatus === 'NOT_SUBMITTED' && (
              <span className="flex items-center gap-1 bg-slate-800 text-slate-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-slate-700">
                <User size={14} />
                Não Verificado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 p-4 rounded-xl flex items-start gap-3 animate-fade-in text-sm">
          <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
          <div>{successMsg}</div>
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-950/40 border border-red-900 text-red-400 p-4 rounded-xl flex items-start gap-3 animate-fade-in text-sm">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Compliance Callout based on Status */}
      {currentUser.verificationStatus === 'APPROVED' && (
        <div className="bg-gradient-to-r from-emerald-950/20 to-slate-900/40 border border-emerald-900/30 p-5 rounded-2xl space-y-2">
          <h2 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <CheckCircle size={16} />
            Parabéns! Conta de Investidor Certificada
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            A sua identidade foi avaliada de acordo com as diretivas da CMC (Comissão do Mercado de Capitais de Angola).
            A sua conta usufrui de liquidez estendida e limite de operações expandido para além de 5,000,000 AOA diários.
            O seu consentimento está digitalmente anexado à apólice operacional com as assinaturas verificadas em {existingData?.submittedAt ? new Date(existingData.submittedAt).toLocaleDateString() : 'data recente'}.
          </p>
        </div>
      )}

      {currentUser.verificationStatus === 'PENDING' && (
        <div className="bg-gradient-to-r from-amber-950/10 to-slate-900/40 border border-amber-900/20 p-5 rounded-1.5xl space-y-2">
          <h2 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
            <Clock size={16} />
            Documentação em Auditoria
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Submeteu a sua verificação juridíca em {existingData?.submittedAt ? new Date(existingData.submittedAt).toLocaleString() : 'data recente'}.
            Os nossos analistas de compliance de Luanda estão a avaliar a frente/verso do seu Bilhete de Identidade (BI), o autorretrato físico (selfie) e a sua assinatura do contrato de adesão.
            As aprovações ocorrem normalmente em até 1 hora. Pode continuar a operar em conta demonstração normalmente.
          </p>
        </div>
      )}

      {currentUser.verificationStatus === 'REJECTED' && (
        <div className="bg-gradient-to-r from-red-950/20 to-slate-900/40 border border-red-900/30 p-5 rounded-2xl space-y-2">
          <h2 className="text-sm font-semibold text-red-500 flex items-center gap-2">
            <AlertTriangle size={16} />
            Necessita Correção na Documentação de Identidade
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Infelizmente, a equipa de compliance rejeitou o seu envio recente. As razões comuns incluem:
            Legibilidade baixa da foto do BI, falta de correspondência dos dados pessoais digitados com o documento, ou assinatura desalinhada do contrato operacional.
            Por favor, verifique os seus dados abaixo, efetue os uploads corretos e redesenhe a sua assinatura no contrato.
          </p>
        </div>
      )}

      {/* Support Chat Referral Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MessageCircle size={14} className="text-amber-500" />
            Precisa de Ajuda com a Verificação?
          </h3>
          <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
            Se tiver dúvidas sobre como carregar o seu Bilhete de Identidade (BI), tirar a fotografia de selfie, ou necessitar de auxílio com a assinatura digital do contrato de adesão em Angola, inicie um chat com o nosso suporte de compliance.
          </p>
        </div>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-support-chat'))}
          className="shrink-0 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-amber-500 hover:text-amber-400 text-[11px] font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
        >
          <MessageCircle size={13} />
          Falar com o Suporte
        </button>
      </div>

      {/* Verification Stepper Flow - HIDDEN if Approved OR Pending */}
      {(currentUser.verificationStatus === 'NOT_SUBMITTED' || currentUser.verificationStatus === 'REJECTED') && (
        <div className="space-y-6">
          {/* Stepper Header */}
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setActiveStep(1)}
              className={`pb-3 border-b-2 text-center transition-all ${
                activeStep === 1 
                  ? 'border-amber-500 text-amber-400 font-bold' 
                  : 'border-slate-800 text-slate-500'
              }`}
            >
              <span className="block text-xs uppercase font-mono tracking-widest">Etapa 1</span>
              <span className="text-xs font-semibold">Dados Pessoais</span>
            </button>
            <button 
              onClick={() => setActiveStep(2)}
              className={`pb-3 border-b-2 text-center transition-all ${
                activeStep === 2 
                  ? 'border-amber-500 text-amber-400 font-bold' 
                  : 'border-slate-800 text-slate-500'
              }`}
              disabled={!firstName || !lastName}
            >
              <span className="block text-xs uppercase font-mono tracking-widest">Etapa 2</span>
              <span className="text-xs font-semibold">Upload do BI</span>
            </button>
            <button 
              onClick={() => setActiveStep(3)}
              className={`pb-3 border-b-2 text-center transition-all ${
                activeStep === 3 
                  ? 'border-amber-500 text-amber-400 font-bold' 
                  : 'border-slate-800 text-slate-500'
              }`}
              disabled={!biFront || !biBack || !selfieWithBi}
            >
              <span className="block text-xs uppercase font-mono tracking-widest">Etapa 3</span>
              <span className="text-xs font-semibold">Assinar Contrato</span>
            </button>
          </div>

          {/* STEP 1: Personal Data Form */}
          {activeStep === 1 && (
            <form onSubmit={saveBasicDetails} className="space-y-6 animate-fade-in bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50">
              <h3 className="text-sm font-display font-medium text-slate-300 border-b border-slate-800 pb-2">
                1. Introduza os seus dados cadastrais (em conformidade com o seu BI)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                    Nome <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-500" size={16} />
                    <input 
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ex: Manuel"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                    Último Nome <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-500" size={16} />
                    <input 
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ex: Chitombe"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                    Data de Nascimento <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-slate-500" size={16} />
                    <input 
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                    Número de Contacto <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-500" size={16} />
                    <input 
                      type="tel"
                      required
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Ex: +244 923 000 000"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-mono uppercase tracking-widest text-slate-400 mb-1.5">
                    Localização (Província / Município / Bairro) <span className="text-amber-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-500" size={16} />
                    <input 
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Luanda, Talatona, Lar do Patriota"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/10"
                >
                  Confirmar e Prosseguir
                  <span className="text-slate-700">→</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ID Card uploads */}
          {activeStep === 2 && (
            <div className="space-y-6 animate-fade-in bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50">
              <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
                <h3 className="text-sm font-display font-medium text-slate-300">
                  2. Envie o seu Bilhete de Identidade (BI) angolano
                </h3>
                <span className="text-[10px] font-mono text-amber-400">Formatos aceites: PNG, JPEG</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* BI Front */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Frente do BI <span className="text-amber-500">*</span>
                  </label>
                  
                  {biFront ? (
                    <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-between h-40">
                      <img src={biFront} alt="Frente do BI" className="max-h-24 w-auto object-contain rounded hover:scale-105 transition-all" />
                      <button 
                        onClick={() => setBiFront('')}
                        className="text-[10px] font-mono text-red-400 hover:text-red-500 hover:underline pt-1"
                      >
                        Substituir imagem
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col items-center justify-center p-6 h-40 group cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setBiFront)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="text-slate-600 group-hover:text-amber-500 transition-all mb-2" size={24} />
                      <p className="text-xs font-semibold text-slate-300 text-center">Frente BI Card</p>
                      <p className="text-[9px] text-slate-500 text-center mt-1">Clique para carregar</p>
                    </div>
                  )}
                </div>

                {/* BI Back */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Verso do BI <span className="text-amber-500">*</span>
                  </label>
                  
                  {biBack ? (
                    <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-between h-40">
                      <img src={biBack} alt="Verso do BI" className="max-h-24 w-auto object-contain rounded hover:scale-105 transition-all" />
                      <button 
                        onClick={() => setBiBack('')}
                        className="text-[10px] font-mono text-red-400 hover:text-red-500 hover:underline pt-1"
                      >
                        Substituir imagem
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col items-center justify-center p-6 h-40 group cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setBiBack)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="text-slate-600 group-hover:text-amber-500 transition-all mb-2" size={24} />
                      <p className="text-xs font-semibold text-slate-300 text-center">Verso BI Card</p>
                      <p className="text-[9px] text-slate-500 text-center mt-1">Clique para carregar</p>
                    </div>
                  )}
                </div>

                {/* Selfie holding BI */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Selfie segurando o BI <span className="text-amber-500">*</span>
                  </label>
                  
                  {selfieWithBi ? (
                    <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-between h-40">
                      <img src={selfieWithBi} alt="Selfie com BI" className="max-h-24 w-auto object-contain rounded hover:scale-105 transition-all" />
                      <button 
                        onClick={() => setSelfieWithBi('')}
                        className="text-[10px] font-mono text-red-400 hover:text-red-500 hover:underline pt-1"
                      >
                        Substituir imagem
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-800 rounded-xl hover:border-slate-700 transition-all flex flex-col items-center justify-center p-6 h-40 group cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setSelfieWithBi)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="text-slate-600 group-hover:text-amber-500 transition-all mb-2" size={24} />
                      <p className="text-xs font-semibold text-slate-300 text-center">Rosto + BI na mão</p>
                      <p className="text-[9px] text-slate-500 text-center mt-1">Certifique a legibilidade</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="bg-slate-950 border border-slate-800 text-slate-400 hover:text-white px-5 py-2.5 rounded-xl text-xs transition-all"
                >
                  ← Voltar aos Dados
                </button>
                <button
                  type="button"
                  disabled={!biFront || !biBack || !selfieWithBi}
                  onClick={() => setActiveStep(3)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    biFront && biBack && selfieWithBi
                      ? 'bg-amber-500 text-slate-955 shadow-md shadow-amber-500/10 hover:bg-amber-600'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Prosseguir para o Contrato →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Sign platform consent contract */}
          {activeStep === 3 && (
            <div className="space-y-6 animate-fade-in bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50">
              <h3 className="text-sm font-display font-medium text-slate-300 border-b border-slate-800 pb-2">
                3. Leia o Contrato de Consentimento e Desenhe a sua Assinatura
              </h3>

              {/* Digital legal contract scrollable viewport */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 h-64 overflow-y-scroll text-[11px] text-slate-400 space-y-4 font-sans leading-relaxed scrollbar-thin">
                <p className="font-bold text-center text-slate-200 uppercase font-display text-xs">
                  CONTRATO DE ADESÃO OPERACIONAL E DECLARAÇÃO DE CONSENTIMENTO JURÍDICO
                </p>
                <p className="text-slate-500 text-right">Luanda, Angola - {new Date().toLocaleDateString('pt-AO')}</p>
                
                <p>
                  <strong>ENTRE:</strong> <br />
                  A Plataforma <strong>KzOption / KwanzaTrade (BNA certificada)</strong>, doravante designada como "PLATAFORMA", e o aderente cadastrado como <strong>{firstName || currentUser.name} {lastName || ''}</strong>, doravante designado como "INVESTIDOR", residente em <strong>{location || 'Angola'}</strong> com contacto móvel <strong>{contactNumber || 'N/A'}</strong>.
                </p>

                <p>
                  <strong>1. OBJETO DO CONTRATO:</strong> <br />
                  O presente contrato define os termos e direitos de representação, intermediação simulada e de investimento sob moedas criptográficas e índices derivados expressos em Kwanzas (AOA) de Angola. Ao assinar digitalmente este instrumento, o INVESTIDOR concorda inequivocamente em obedecer às diretivas de conformidade no que tange a operações financeiras e a prestação voluntária de dados verídicos e fotos de identificação.
                </p>

                <p>
                  <strong>2. DA RESPONSABILIDADE FINANCEIRA:</strong> <br />
                  O INVESTIDOR reconhece e aceita voluntariamente que mercado de capitais envolve flutuações severas e que a KzOption fornece canais de liquidez adicionais para Angola. O levantamento de capital requer a aprovação de comprovativos compatíveis com os canais bancários designados no país.
                </p>

                <p>
                  <strong>3. DO TRATAMENTO DE DADOS (LGPD):</strong> <br />
                  O INVESTIDOR expressa o seu total consentimento para que as imagens providenciadas fiquem armazenadas criptografadamente sob as políticas de segurança corporativas internos para salvaguardar operações fraudulentas, mitigação de lavagem de capitais e em conformidade estrita com o Banco Nacional de Angola (BNA).
                </p>

                <p className="border-t border-slate-800 pt-3">
                  <strong>4. DECLARAÇÃO DE VERACIDADE:</strong> <br />
                  Declaro para os devidos efeitos de direito que sou maior de idade na República de Angola, que o Bilhete de Identidade (BI) submetido é de minha inteira propriedade jurídica, as imagens não sofreram adulterações digitais e que a assinatura colhida expressa a minha concordância aos termos de serviço da KzOption.
                </p>
              </div>

              {/* Signature Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      Área de Assinatura Digital <span className="text-amber-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[10px] font-mono text-red-400 hover:text-red-500 flex items-center gap-1 transition-all"
                    >
                      <Eraser size={12} />
                      Limpar Desenho
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500">Desenhe a sua assinatura manual com o rato ou com o ecrã tátil do telemóvel no painel abaixo:</p>
                  
                  {/* Digital Signature Pad Canvas */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl relative overflow-hidden h-44 cursor-crosshair">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="absolute inset-0 w-full h-full"
                    />
                    {!signature && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-600 select-none pointer-events-none text-xs font-mono">
                        [ ASSINE AQUI ]
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Preview signature card and check indicators */}
                <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60 h-full flex flex-col justify-between">
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Resumo da Identidade</p>
                    <div className="space-y-1 font-mono text-xs text-slate-400">
                      <p><span className="text-slate-500">Aderente:</span> {firstName} {lastName}</p>
                      <p><span className="text-slate-500">Contacto:</span> {contactNumber}</p>
                      <p><span className="text-slate-500">Nascimento:</span> {birthDate}</p>
                      <p><span className="text-slate-500">Província:</span> {location}</p>
                    </div>
                  </div>

                  {signature && (
                    <div className="border border-amber-500/20 bg-amber-500/5 p-3 rounded-xl space-y-1">
                      <p className="text-[9px] font-mono text-amber-500 tracking-wider">PREVISÃO DA ASSINATURA CONTRATUAL:</p>
                      <div className="h-14 bg-slate-900 rounded-lg border border-slate-850 flex items-center justify-center p-1">
                        <img src={signature} alt="Assinatura digitalizada" className="max-h-full max-w-full object-contain invert opacity-90" />
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 border-t border-slate-850 pt-2 flex items-start gap-1.5 leading-relaxed">
                    <Edit3 size={14} className="text-slate-500 shrink-0 mt-0.5" />
                    <span>Ao clicar em submeter, você outorga digitalmente que leu e autoriza esta apólice com validade jurídica de conformidade em Luanda.</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="bg-slate-950 border border-slate-800 text-slate-400 hover:text-white px-5 py-2.5 rounded-xl text-xs transition-all"
                >
                  ← Voltar aos Uploads
                </button>
                <button
                  type="button"
                  disabled={!signature}
                  onClick={handleVerificationSubmit}
                  className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    signature
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 hover:bg-amber-600'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ShieldCheck size={16} />
                  Submeter Contrato e Identificação
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Basic Data view/editing (always editable or read-only based on approved/pending) */}
      {(currentUser.verificationStatus === 'APPROVED' || currentUser.verificationStatus === 'PENDING') && (
        <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50 space-y-4">
          <h3 className="text-sm font-display font-medium text-slate-300 border-b border-slate-800 pb-2">
            Meus Dados Cadastrados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-slate-500 block font-mono text-[10px] uppercase">Primeiro Nome</span>
              <span className="text-slate-200 text-sm font-semibold">{existingData?.firstName || currentUser.name.split(' ')[0]}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-slate-500 block font-mono text-[10px] uppercase">Último Nome</span>
              <span className="text-slate-200 text-sm font-semibold">{existingData?.lastName || currentUser.name.split(' ').slice(1).join(' ') || '-'}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-slate-500 block font-mono text-[10px] uppercase">Data de Nascimento</span>
              <span className="text-slate-200 text-sm font-semibold">{existingData?.birthDate || '-'}</span>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-slate-500 block font-mono text-[10px] uppercase">Localização</span>
              <span className="text-slate-200 text-sm font-semibold">{existingData?.location || '-'}</span>
            </div>
            <div className="p-3 md:col-span-2 bg-slate-950 rounded-xl border border-slate-900">
              <span className="text-slate-500 block font-mono text-[10px] uppercase">Contacto Móvel</span>
              <span className="text-slate-200 text-sm font-semibold">{existingData?.contactNumber || '-'}</span>
            </div>
          </div>

          {existingData?.signatureDataUrl && (
            <div className="pt-4 border-t border-slate-900 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-400">Assinatura Certificada</p>
                <p className="text-[10px] text-slate-500">Registada digitalmente nos sistemas de compliance da CMC de Angola</p>
              </div>
              <div className="h-10 w-28 bg-slate-900 rounded border border-slate-800 p-1 flex items-center justify-center">
                <img src={existingData.signatureDataUrl} alt="Assinatura certificada" className="max-h-full max-w-full object-contain invert opacity-80" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* General Information Card */}
      <div className="bg-slate-950/20 rounded-xl border border-slate-850 p-4 text-[11px] text-slate-500 flex items-start gap-3">
        <BadgeHelp size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-400">Por que a verificação é necessária?</p>
          <p className="leading-relaxed">
            De acordo com os regulamentos angolanos contra o branqueamento de capitais (Prevenção e Combate ao Branqueamento de Capitais de Angola) e regulamentações do BNA, todo o investidor que opera na plataforma deve fornecer provas válidas de identificação civil nacional (BI Angolano) e aceitação de termos operacionais de risco. Agradecemos a sua colaboração.
          </p>
        </div>
      </div>
    </div>
  );
}
