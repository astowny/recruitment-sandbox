
import React, { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage } from '../types';
import { UserIcon, BotIcon, SendIcon, LoadingIcon } from './icons';

const Chatbot: React.FC = () => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const chat = ai.chats.create({ 
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are a helpful and friendly AI assistant. Keep your responses concise and to the point.'
            }
        });
        setChatSession(chat);
        setMessages([{
            role: 'model',
            content: 'Hello! How can I assist you today?'
        }]);
      } catch (e) {
        setError("Failed to initialize the chat session. Please check your API key.");
        console.error(e);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chatSession) return;

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setUserInput('');
    setError(null);

    try {
      const stream = await chatSession.sendMessageStream({ message: userInput });
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', content: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = modelResponse;
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to get response: ${errorMessage}`);
      setMessages(prev => prev.slice(0, -1)); // Remove the empty model message
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, chatSession]);
  
  const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
      <div className={`flex items-start gap-3 my-4 ${isModel ? '' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-blue-500' : 'bg-gray-600'}`}>
          {isModel ? <BotIcon /> : <UserIcon />}
        </div>
        <div className={`p-3 rounded-lg max-w-lg ${isModel ? 'bg-gray-800' : 'bg-blue-600'}`}>
          <p className="text-white whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] max-w-4xl mx-auto bg-gray-800/50 rounded-lg shadow-2xl border border-gray-700">
      <div className="flex-1 p-6 overflow-y-auto">
        {messages.map((msg, index) => <Message key={index} message={msg} />)}
        <div ref={messagesEndRef} />
        {isLoading && messages[messages.length-1].role === 'user' && (
             <div className="flex items-start gap-3 my-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500">
                    <BotIcon />
                </div>
                <div className="p-3 rounded-lg bg-gray-800 flex items-center">
                    <LoadingIcon />
                </div>
            </div>
        )}
      </div>
      {error && <div className="p-4 text-red-400 border-t border-gray-700">{error}</div>}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            disabled={isLoading || !chatSession}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim() || !chatSession}
            className="bg-blue-600 text-white rounded-lg p-3 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors flex items-center justify-center"
          >
            {isLoading ? <LoadingIcon /> : <SendIcon />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
