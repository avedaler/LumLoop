import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useUser } from "../App";
import { apiRequest, queryClient } from "../lib/queryClient";
import { ArrowUp, Sparkles, Trash2, X } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "Why was Ashwagandha recommended for me?",
  "How can I improve my sleep score?",
  "What should I eat before a workout?",
  "Explain my biological age breakdown",
  "How do my supplements interact?",
  "What's the best time for cold exposure?",
];

export default function Coach({ onClose }: { onClose: () => void }) {
  const { user } = useUser();
  const userId = user?.id || 1;
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: history = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", userId, "history"],
    queryFn: async () => {
      const r = await apiRequest("GET", `/api/chat/${userId}/history`);
      return r.json();
    },
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const r = await apiRequest("POST", `/api/chat/${userId}`, { message });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId, "history"] });
    },
  });

  const clearHistory = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/chat/${userId}/history`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", userId, "history"] });
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, sendMessage.isPending]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || sendMessage.isPending) return;
    setInput("");
    sendMessage.mutate(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full bg-background border-l border-border/30 flex flex-col" data-testid="coach-panel">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles size={14} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">AI Wellness Coach</h2>
            <p className="text-[10px] text-primary font-medium">Powered by LumLoop Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {history.length > 0 && (
            <button
              onClick={() => clearHistory.mutate()}
              className="w-7 h-7 rounded-md bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-testid="clear-chat"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            data-testid="close-coach"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {history.length === 0 && !sendMessage.isPending && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-3">
              <Sparkles size={20} className="text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Ask your wellness coach</h3>
            <p className="text-xs text-muted-foreground max-w-[280px] mb-5">
              I know your supplements, bio age, sleep data, and wellness goals. Ask me anything.
            </p>
            {/* Quick prompts */}
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[340px]">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-xs px-3 py-1.5 rounded-md bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all"
                  data-testid={`quick-${q.slice(0, 10).replace(/\s/g, "-")}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div key={i} className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-card border border-border/40 text-foreground rounded-bl-sm"
            }`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={10} className="text-primary" />
                  <span className="text-[9px] text-primary font-bold uppercase tracking-wider">Coach</span>
                </div>
              )}
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sendMessage.isPending && (
          <div className="mb-3 flex justify-start">
            <div className="bg-card border border-border/40 rounded-xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={10} className="text-primary" />
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider">Coach</span>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40" style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border/30">
        <div className="flex items-end gap-2 bg-card border border-border/50 rounded-xl px-3 py-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about supplements, sleep, nutrition..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none max-h-20"
            style={{ lineHeight: "1.5" }}
            data-testid="chat-input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
              input.trim() && !sendMessage.isPending
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground/30"
            }`}
            data-testid="send-button"
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
