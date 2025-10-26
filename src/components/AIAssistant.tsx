import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import useGameStore from '../store/gameStore';

/**
 * Props for the AIAssistant component.
 */
interface AIAssistantProps {
    /** The list of chat messages to display. */
    messages: ChatMessage[];
    /** Callback function to execute when a message is sent. */
    onSendMessage: (message: string) => void;
    /** Callback when "Get Advice" button is clicked. */
    onGetAdvice?: () => void;
    /** Indicates whether the AI is currently processing a message. */
    isLoading: boolean;
    /** Whether it's currently the user's turn (enables Get Advice button). */
    isUserTurn?: boolean;
    /** Whether automatic advice is being loaded. */
    isAutoAdviceLoading?: boolean;
    /** The latest coaching advice (displayed prominently). */
    latestAdvice?: string;
}

/**
 * A chat component that allows the user to interact with the AI coach.
 *
 * This component displays the conversation history, provides an input field for the user
 * to send new messages, shows a prominent "Get Advice" button, and displays the latest
 * coaching advice in a highlighted section.
 *
 * @param {AIAssistantProps} props The props for the component.
 */
const AIAssistant: React.FC<AIAssistantProps> = ({ 
    messages, 
    onSendMessage, 
    onGetAdvice,
    isLoading, 
    isUserTurn = false,
    isAutoAdviceLoading = false,
    latestAdvice
}) => {
    const [input, setInput] = useState('');
    const autoAdviceEnabled = useGameStore(s => s.autoAdviceEnabled);
    const setAutoAdviceEnabled = useGameStore(s => s.setAutoAdviceEnabled);
    const [showFullHistory, setShowFullHistory] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const handleGetAdvice = () => {
        if (onGetAdvice && !isLoading && !isAutoAdviceLoading) {
            onGetAdvice();
        }
    };

    return (
        <div className="w-full bg-background-dark/50 rounded-xl flex flex-col p-4 border border-white/10 h-[520px]">
            {/* Auto-advice toggle - Fixed height */}
            <div className="mb-4 h-6 flex-shrink-0">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={autoAdviceEnabled}
                            onChange={(e) => setAutoAdviceEnabled(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-blue-600 transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-white/90 text-sm font-medium">Auto-advice</span>
                </label>
            </div>

            {/* Always-visible stream: Fixed height */}
            <div ref={messagesContainerRef} className="h-[360px] flex-shrink-0 space-y-3 overflow-y-auto pr-2 mb-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                {[...messages]
                    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
                    .map((msg, index) => {
                        // Action messages with different styling based on action type
                        if (msg.type === 'action') {
                            let bgColor = 'bg-white/5';
                            let textColor = 'text-white/70';
                            let icon = '•';
                            
                            switch (msg.actionType) {
                                case 'fold':
                                    bgColor = 'bg-gray-800/30 border border-gray-600/40';
                                    textColor = 'text-gray-400';
                                    icon = '✕';
                                    break;
                                case 'call':
                                    bgColor = 'bg-blue-900/20 border border-blue-500/30';
                                    textColor = 'text-blue-300';
                                    icon = '✓';
                                    break;
                                case 'raise':
                                case 'bet':
                                    bgColor = 'bg-blue-900/20 border border-blue-500/30';
                                    textColor = 'text-green-300';
                                    icon = '↑';
                                    break;
                                case 'check':
                                    bgColor = 'bg-gray-700/20 border border-gray-500/30';
                                    textColor = 'text-gray-300';
                                    icon = '−';
                                    break;
                                case 'blind':
                                    bgColor = 'bg-purple-900/20 border border-purple-500/30';
                                    textColor = 'text-purple-300';
                                    icon = '◉';
                                    break;
                                case 'newhand':
                                    bgColor = 'bg-yellow-900/20 border border-yellow-500/30';
                                    textColor = 'text-yellow-300';
                                    icon = '🎴';
                                    break;
                            }
                            
                            // Determine if this is a user action, AI action, or dealer action
                            const isUserAction = msg.text.startsWith('You ');
                            const isDealerAction = msg.actionType === 'newhand';
                            
                            // Dealer actions centered, user actions right, AI actions left
                            const justifyClass = isDealerAction ? 'justify-center' : isUserAction ? 'justify-end' : 'justify-start';
                            
                            return (
                                <div key={index} className={`flex items-center ${justifyClass}`}>
                                    <div className={`${bgColor} rounded-lg px-3 py-1.5 text-xs ${textColor} font-medium`}>
                                        <span className="mr-1.5">{icon}</span>
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        }
                        
                        // User messages on the right
                        if (msg.author === 'User') {
                            return (
                                <div key={index} className="flex items-start gap-3 justify-end">
                                    <div className="bg-blue-600/60 rounded-lg p-3 text-sm text-white max-w-[80%]">
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            );
                        }
                        
                        // AI messages on the left
                        return (
                            <div key={index} className="flex items-start gap-3">
                                <div className="size-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-bold text-background-dark text-xs">A</div>
                                <div className="bg-white/10 rounded-lg p-3 text-sm text-white max-w-[80%]">
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            </div>
                        );
                    })}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="size-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-bold text-background-dark text-xs">A</div>
                        <div className="bg-white/10 rounded-lg p-3 text-white text-sm">
                            <div className="flex items-center space-x-1.5">
                                <span className="text-white/80">Thinking</span>
                                <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Form - Fixed height */}
            <form onSubmit={handleSubmit} className="flex-shrink-0 flex items-stretch gap-2">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    placeholder="Ask a question about poker..."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="flex items-center justify-center rounded-lg w-12 bg-primary text-background-dark disabled:bg-gray-500/30 disabled:text-gray-400 transition-colors hover:bg-primary/90 flex-shrink-0"
                    disabled={isLoading || !input.trim()}
                >
                    <span className="material-symbols-outlined text-lg">send</span>
                </button>
            </form>
        </div>
    );
};

export default AIAssistant;
