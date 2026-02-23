import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Send, Loader2, X } from "lucide-react";
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
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl p-6 shadow-xl shadow-violet-500/20 transition-all select-none group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-lg font-semibold mb-1">AI Sales Pitch Assistant</h2>
                <p className="text-sm text-violet-100">Get help crafting pitches, handling objections, and closing deals</p>
              </div>
              <div className="text-violet-200 group-hover:translate-x-1 transition-transform">
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
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm w-10 h-10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI Sales Pitch Assistant</h3>
                  <p className="text-xs text-violet-100">Ask me anything about sales pitches</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
                className="text-white hover:bg-white/20 rounded-xl select-none"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/50">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400">Start a conversation to get sales pitch help</p>
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
                        ? "bg-violet-600 text-white"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        className="text-sm prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-violet-600 dark:text-violet-400">{children}</strong>,
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
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about pitch strategies, objections, stats..."
                  className="flex-1 rounded-xl border-zinc-300 dark:border-zinc-700"
                  disabled={loading || !conversation}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || !conversation}
                  className="bg-violet-600 hover:bg-violet-700 rounded-xl select-none px-4"
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