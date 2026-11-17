import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/axiosClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { IconX, IconSparkles, IconSend, IconAlertCircle } from '../ui/Icons.jsx';
import { SeverityIndicator } from '../ui/Indicators.jsx';

const DISPATCHER_ROLES = ['eoc', 'admin', 'rescue_team'];

const CITIZEN_SUGGESTIONS = [
  'Water is entering my house',
  'I smell smoke nearby',
  'Someone is injured',
  'Nearest relief shelter',
];

const EOC_SUGGESTIONS = [
  'Show all unverified flood reports',
  'Critical incidents that are active',
  'Show resolved reports',
];

export function AssistantChat({ dark = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isDispatcher = DISPATCHER_ROLES.includes(user?.role);

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      from: 'assistant',
      text: isDispatcher
        ? 'ResQNet Dispatch Assistant ready. Ask me to filter incidents, query categories, or summarize regional status.'
        : "ResQNet Safety Guidance assistant. I can offer basic disaster safety guidance or help find nearby open shelters. For life-threatening emergencies, call official services (112) immediately.",
    },
  ]);
  const [coords, setCoords] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isDispatcher || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
      () => setCoords(null),
      { timeout: 5000 }
    );
  }, [isDispatcher]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = useMutation({
    mutationFn: async (text) =>
      (await api.post('/ai/chat', { message: text, ...(coords || {}) })).data,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { from: 'assistant', text: data.reply, incidents: data.incidents },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          from: 'assistant',
          text: 'The advisory service is temporarily unavailable. Please refer to direct emergency contacts if in danger.',
        },
      ]);
    },
  });

  const handleSend = (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { from: 'user', text: trimmed }]);
    setInput('');
    sendMessage.mutate(trimmed);
  };

  const suggestions = isDispatcher ? EOC_SUGGESTIONS : CITIZEN_SUGGESTIONS;

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div
          className={`mb-3 flex flex-col w-[340px] sm:w-[380px] h-[480px] rounded-panel shadow-modal border overflow-hidden animate-fade-in ${
            dark
              ? 'bg-surfaceDark-panel border-surfaceDark-border text-white'
              : 'bg-white border-line text-slate-900'
          }`}
          role="dialog"
          aria-label={isDispatcher ? 'EOC Dispatch Assistant' : 'Safety Guidance Assistant'}
        >
          {/* Header */}
          <div
            className={`p-3.5 border-b flex items-center justify-between ${
              dark
                ? 'bg-surfaceDark-raised border-surfaceDark-border'
                : 'bg-slate-50 border-line'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-control bg-blue-700 text-white flex items-center justify-center">
                <IconSparkles width={14} height={14} />
              </span>
              <div>
                <p className="text-xs font-bold leading-tight">
                  {isDispatcher ? 'EOC Dispatch Assistant' : 'Safety Guidance Assistant'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  ADVISORY ONLY · NOT DISPATCH
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-control hover:bg-black/10 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close assistant"
            >
              <IconX width={16} height={16} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-control p-3 leading-relaxed ${
                    m.from === 'user'
                      ? 'bg-blue-700 text-white font-medium'
                      : dark
                      ? 'bg-surfaceDark-raised border border-surfaceDark-border text-slate-200'
                      : 'bg-slate-50 border border-line text-slate-800'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Incident search results */}
                  {m.incidents?.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-line/20 space-y-1.5">
                      <p className="text-[10px] font-mono uppercase text-slate-400">
                        Matching Records ({m.incidents.length}):
                      </p>
                      {m.incidents.map((inc) => (
                        <button
                          key={inc._id}
                          onClick={() => {
                            setOpen(false);
                            navigate(isDispatcher ? `/eoc/incidents/${inc._id}` : `/eoc`);
                          }}
                          className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-control text-left border transition-colors ${
                            dark
                              ? 'border-surfaceDark-border hover:bg-surfaceDark-panel'
                              : 'border-line hover:bg-white'
                          }`}
                        >
                          <span className="truncate font-medium">{inc.title}</span>
                          <SeverityIndicator severity={inc.severity} dark={dark} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Consulting advisory system…</span>
              </div>
            )}
          </div>

          {/* Quick Suggestions & Input */}
          <div
            className={`p-3 border-t ${
              dark
                ? 'bg-surfaceDark-panel border-surfaceDark-border'
                : 'bg-slate-50/50 border-line'
            }`}
          >
            <div className="flex flex-wrap gap-1 mb-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    dark
                      ? 'border-surfaceDark-border text-slate-400 hover:text-white hover:border-blue-600'
                      : 'border-line text-slate-600 hover:text-blue-700 hover:border-blue-700 bg-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isDispatcher ? 'Query incidents or filter…' : 'Ask for safety advice…'}
                className={`flex-1 min-h-[36px] px-3 text-xs rounded-control border focus:outline-none focus:ring-1 focus:ring-blue-700 ${
                  dark
                    ? 'bg-surfaceDark-raised border-surfaceDark-border text-white placeholder:text-slate-500'
                    : 'bg-white border-line text-slate-900 placeholder:text-slate-400'
                }`}
              />
              <button
                type="submit"
                disabled={sendMessage.isPending || !input.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-control bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 transition-colors shrink-0"
                aria-label="Send query"
              >
                <IconSend width={14} height={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-13 h-13 rounded-full bg-blue-700 hover:bg-blue-800 text-white shadow-modal flex items-center justify-center transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-blue-700"
        aria-label="Toggle assistant guidance chat"
      >
        {open ? <IconX width={22} height={22} /> : <IconSparkles width={22} height={22} />}
      </button>
    </div>
  );
}

export default AssistantChat;
