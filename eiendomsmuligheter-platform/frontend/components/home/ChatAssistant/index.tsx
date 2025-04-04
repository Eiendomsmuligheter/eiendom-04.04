import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Bot, X, MessageSquare } from 'lucide-react';
import { Button } from '../../common/Button';

// Demo meldinger for chat-assistenten
const initialMessages = [
  {
    id: 1,
    text: 'Hei! Jeg er din eiendomsassistent. Hvordan kan jeg hjelpe deg i dag?',
    sender: 'bot',
    time: new Date(Date.now() - 5000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

// Forhåndsdefinerte spørsmål
const suggestedQuestions = [
  'Hvordan fungerer 3D-modelleringen?',
  'Hva koster tjenesten?',
  'Hvordan starter jeg en analyse?',
  'Hvilke områder dekker dere?'
];

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState('');

  // Funksjon for å sende melding
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    // Legg til brukermelding
    const newUserMessage = {
      id: messages.length + 1,
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    
    // Simuler en respons fra assistenten
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: `Takk for spørsmålet! Dette er en demoversjon av assistenten, så jeg kan ikke svare på "${text}" akkurat nå. I den ferdige versjonen vil du få grundige svar på alle dine eiendomsrelaterte spørsmål.`,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };
  
  // Håndtere innsending av skjema
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };
  
  // Animasjon for chat-vinduet
  const chatVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
  };
  
  // Animasjon for meldinger
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };
  
  return (
    <>
      {/* Chat-knapp */}
      <button
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </button>
      
      {/* Chat-vindu */}
      {isOpen && (
        <motion.div
          className="fixed bottom-6 right-6 w-full max-w-md z-50"
          variants={chatVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col h-[500px] bg-gray-800/90 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6 text-blue-400" />
                <h3 className="font-semibold text-white">Eiendomsassistent</h3>
              </div>
              <button
                className="text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Chat-meldinger */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <div className="flex items-start mb-1">
                    {message.sender === 'bot' && (
                        <Bot className="h-4 w-4 mr-1 text-blue-400" />
                      )}
                      {message.sender === 'user' && (
                        <User className="h-4 w-4 mr-1 text-white" />
                      )}
                      <span className="text-xs opacity-70">{message.time}</span>
                    </div>
                    <p>{message.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Foreslåtte spørsmål */}
            {messages.length <= 2 && (
            <div className="p-4 border-t border-white/10">
              <p className="text-sm text-gray-400 mb-2">Foreslåtte spørsmål:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button 
                    key={index}
                    className="text-sm px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-blue-300 transition-colors"
                    onClick={() => sendMessage(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
            )}
            
            {/* Input-felt */}
            <div className="p-4 border-t border-white/10">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Skriv en melding..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button type="submit" variant="primary" className="p-2">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
} 