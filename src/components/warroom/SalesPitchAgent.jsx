import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";

export default function SalesPitchAgent() {
  const [expanded, setExpanded] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (expanded && !conversation) {
      initConversation();
    }
  }, [expanded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initConversation = async () => {
    const conv = await base44.agents.createConversation({
      agent_name: "sales_pitch_assistant",
      metadata: { name: "Sales Pitch Session" }
    });
    setConversation(conv);
    setMessages(conv.messages || []);

    base44.agents.subscribeToConversation(conv.id, (data) => {
      setMessages(data.messages);
      setLoading(false);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;

    const userMessage = input;
    setInput("");
    setLoading(true);

    await base44.agents.addMessage(conversation, {
      role: "user",
      content: userMessage
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mb-8">
      <AnimatePresence mode="wait">
        {!expanded ? (
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setExpanded(true)}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-700 text-white rounded-2xl p-6 shadow-2xl shadow-cyan-500/30 transition-all select-none group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 animate-pulse" />
            <div className="relative flex items-center gap-4">
              <div className="bg-white/30 backdrop-blur-md w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/40 shadow-lg">
                <svg className="w-7 h-7 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c-3.5 0-6 2.5-6 6 0 2 1 3.5 2 4.5L7 18h10l-1-4.5c1-1 2-2.5 2-4.5 0-3.5-2.5-6-6-6z"/>
                  <circle cx="9" cy="10" r="1"/>
                  <circle cx="15" cy="10" r="1"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-lg font-bold mb-1 tracking-tight">AI Market Intel Assistant</h2>
                <p className="text-sm text-cyan-50 font-medium">Data-backed industry research for closing deals</p>
              </div>
              <div className="text-white group-hover:translate-x-1 transition-transform">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 border-2 border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 p-4 flex items-center justify-between border-b border-cyan-400/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 animate-pulse" />
              <div className="relative flex items-center gap-3">
                <div className="bg-white/30 backdrop-blur-md w-10 h-10 rounded-xl flex items-center justify-center border border-white/40">
                  <svg className="w-5 h-5 text-white animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3c-3.5 0-6 2.5-6 6 0 2 1 3.5 2 4.5L7 18h10l-1-4.5c1-1 2-2.5 2-4.5 0-3.5-2.5-6-6-6z"/>
                    <circle cx="9" cy="10" r="1"/>
                    <circle cx="15" cy="10" r="1"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold tracking-tight">AI Market Intel Assistant</h3>
                  <p className="text-xs text-cyan-50 font-medium">Industry research & sales intelligence</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
                className="relative text-white hover:bg-white/20 rounded-xl select-none"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-950 to-blue-950/50">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="relative inline-block">
                    <svg className="w-12 h-12 text-cyan-400 mx-auto mb-3 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3c-3.5 0-6 2.5-6 6 0 2 1 3.5 2 4.5L7 18h10l-1-4.5c1-1 2-2.5 2-4.5 0-3.5-2.5-6-6-6z"/>
                      <circle cx="9" cy="10" r="1"/>
                      <circle cx="15" cy="10" r="1"/>
                    </svg>
                    <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
                  </div>
                  <p className="text-sm text-cyan-300/70 font-medium">Ask about any industry to get market research</p>
                </div>
              )}
              
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30"
                        : "bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 text-cyan-50 shadow-lg"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm font-medium">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 text-cyan-50">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-2 text-cyan-100">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 text-cyan-100">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold text-cyan-300">{children}</strong>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 rounded-2xl px-4 py-3 shadow-lg">
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-cyan-500/30 p-4 bg-gradient-to-r from-slate-900 to-blue-950">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="what are we sellin' today?"
                  className="flex-1 rounded-xl bg-slate-800/50 border-cyan-500/30 text-cyan-50 placeholder:text-cyan-400/50 placeholder:italic focus:border-cyan-400 focus:ring-cyan-400/30"
                  disabled={loading || !conversation}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || !conversation}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl select-none px-4 shadow-lg shadow-cyan-500/30"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}