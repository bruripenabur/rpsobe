import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Loader2,
  Lightbulb,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { RpsData } from "../types/rps";
import { ChatMessage, sendGeminiChatMessage } from "../services/apiService";

interface GeminiChatboxProps {
  rpsData: RpsData;
  isOpen: boolean;
  onClose: () => void;
  showNotification: (msg: string, type?: "success" | "error" | "info") => void;
}

const INITIAL_GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content: `Halo Bapak/Ibu Dosen! Saya **Gemini OBE Academic Mentor** untuk Universitas Pattimura. 

Saya siap mendampingi perancangan RPS berbasis kurikulum Outcome-Based Education (OBE):
- 🎯 Merumuskan CPMK & Sub-CPMK bertingkat **Taksonomi Bloom (C1–C6)**
- ⚖️ Audit kepatuhan **Pasal 47 Peraturan Rektor No. 12/2026 (Peraturan Akademik UNPATTI)** (Partisipatif & Proyek $\ge 50\%$)
- 🌾 Ide studi kasus kontekstual **Pertanian Kepulauan Maluku**
- 🌊 Integrasi **PIP UNPATTI "Bina Mulia Ke Lautan"** (Agroekosistem, Sasi, Marikultur, Blue Economy)
- 🎓 Penyelarasan **Jenjang KKNI Level 6–9** (Sarjana S1/D4, Profesi, Magister S2, Doktor S3)
- 📚 Rekomendasi pustaka bereputasi & penyelarasan **17 SDGs**

Ada yang ingin didiskusikan terkait mata kuliah yang sedang dirancang saat ini?`,
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export const GeminiChatbox: React.FC<GeminiChatboxProps> = ({
  rpsData,
  isOpen,
  onClose,
  showNotification,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Build lightweight RPS context
      const rpsContext = {
        namaMK: rpsData.namaMK,
        kodeMK: rpsData.kodeMK,
        bobotSKS: rpsData.bobotSKS,
        semester: rpsData.semester,
        selectedCpls: rpsData.selectedCpls,
        selectedSdgs: rpsData.selectedSdgs,
        selectedPipItems: rpsData.selectedPipItems,
        selectedKkniLevels: rpsData.selectedKkniLevels,
        selectedKkniItems: rpsData.selectedKkniItems,
        cpmkCount: rpsData.cpmkList.length,
        subCpmkCount: rpsData.subCpmkList.length,
        assessmentWeights: rpsData.assessmentWeights,
        sampleCpmk: rpsData.cpmkList.slice(0, 3),
        sampleSubCpmk: rpsData.subCpmkList.slice(0, 4),
      };

      const apiHistory = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await sendGeminiChatMessage(apiHistory, rpsContext);

      const assistantMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      showNotification("Gagal mendapatkan respon dari Gemini: " + err.message, "error");
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: "assistant",
        content:
          "⚠️ Maaf, terjadi kendala komunikasi dengan layanan AI. Silakan periksa koneksi atau coba kirimkan kembali pertanyaan Anda.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification("Pesan disalin ke clipboard!", "info");
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleClearHistory = () => {
    setMessages([INITIAL_GREETING]);
    showNotification("Riwayat percakapan direset.", "info");
  };

  const quickPrompts = [
    `Rekomendasikan 3 Sub-CPMK tingkat C4 (Analisis) untuk mata kuliah ${rpsData.namaMK || "ini"}`,
    `Apakah pembobotan evaluasi di RPS saya sudah memenuhi Pasal 47 Peraturan Rektor No. 12/2026 UNPATTI?`,
    `Bagaimana keselarasan Sub-CPMK saya dengan kualifikasi KKNI Level 6 (Sarjana)?`,
    `Berikan ide 1 topik tugas proyek berbasis pertanian kepulauan Maluku & PIP Unpatti`,
    `Bagaimana integrasi SDGs yang relevan untuk mata kuliah ${rpsData.namaMK || "ini"}?`,
  ];

  return (
    <div
      className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl border border-purple-500/30 backdrop-blur-md rounded-2xl overflow-hidden ${
        isMinimized
          ? "bottom-5 right-5 w-72 h-14 bg-slate-900 text-white"
          : isExpanded
          ? "bottom-4 right-4 w-[95vw] md:w-[700px] h-[92vh] max-h-[850px] bg-slate-950 text-slate-100"
          : "bottom-5 right-5 w-[92vw] sm:w-[460px] h-[600px] max-h-[85vh] bg-slate-950 text-slate-100"
      }`}
    >
      {/* Top Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 px-4 py-3 flex items-center justify-between border-b border-purple-900/40 select-none flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <span className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-slate-950"></span>
          </div>

          <div>
            <h3 className="text-xs font-black text-white flex items-center gap-1.5 leading-none">
              <span>Gemini OBE Academic Mentor</span>
            </h3>
            <p className="text-[10px] text-purple-300/80 font-medium truncate max-w-[210px] sm:max-w-[260px] mt-0.5">
              Konteks: {rpsData.namaMK || "RPS Aktif"} ({rpsData.kodeMK || "PPP"})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {!isMinimized && (
            <>
              <button
                type="button"
                onClick={handleClearHistory}
                title="Bersihkan riwayat chat"
                className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Perkecil ukuran" : "Perbesar ukuran"}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition hidden sm:inline-block"
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Buka chat" : "Kecilkan chat"}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition"
          >
            {isMinimized ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Tutup chatbox"
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Conversation Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-200">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-1.5 shadow-md relative group ${
                      isAssistant
                        ? "bg-slate-900/90 text-slate-100 border border-slate-800 leading-relaxed rounded-tl-sm"
                        : "bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-tr-sm font-medium"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-700/40">
                      <span>{msg.timestamp}</span>
                      {isAssistant && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white transition flex items-center gap-1"
                          title="Salin jawaban"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                              <span className="text-emerald-400">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-2.5 h-2.5" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  <span>Gemini sedang menganalisis kurikulum &amp; menyusun jawaban...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-slate-900/80 border-t border-slate-800/80 flex items-center space-x-1.5 overflow-x-auto flex-shrink-0">
            <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1 whitespace-nowrap pl-1">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              Saran Cepat:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-950 text-slate-300 hover:text-white border border-slate-700/80 hover:border-purple-600 font-medium transition whitespace-nowrap flex-shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-end gap-2 flex-shrink-0">
            <textarea
              ref={inputRef}
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan penyelarasan CPL, rumusan CPMK, atau studi kasus... (Enter kirim, Shift+Enter baris baru)"
              className="flex-1 text-xs p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none leading-relaxed"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
              className="h-10 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-xl font-bold transition flex items-center justify-center shadow-md shadow-purple-950/40"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
