import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

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
    const [showFullHistory, setShowFullHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        <div className="w-full bg-background-dark/50 rounded-xl flex flex-col p-4 border border-white/10 h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center font-bold text-background-dark text-lg">
                        A
                    </div>
                    <div>
                        <h3 className="text-white font-bold">AI Coach</h3>
                        <p className="text-white/50 text-xs">Your poker strategy assistant</p>
                    </div>
                </div>
            </div>

            {/* Get Advice Button */}
            {isUserTurn && onGetAdvice && (
                <button
                    onClick={handleGetAdvice}
                    disabled={isLoading || isAutoAdviceLoading}
                    className="w-full mb-4 bg-primary text-background-dark font-bold py-3 px-4 rounded-lg hover:bg-primary/90 disabled:bg-gray-500/30 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                    {isAutoAdviceLoading ? (
                        <>
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                            <span>Coach is thinking...</span>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">psychology</span>
                            <span>Get Advice</span>
                        </>
                    )}
                </button>
            )}

            {!isUserTurn && onGetAdvice && (
                <div className="w-full mb-4 bg-white/5 text-white/50 font-medium py-3 px-4 rounded-lg text-center text-sm">
                    Get Advice button available on your turn
                </div>
            )}

            {/* Latest Advice Panel */}
            {latestAdvice && (
                <div className="mb-4 bg-primary/10 border border-primary/30 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                        <span className="material-symbols-outlined text-primary text-sm">tips_and_updates</span>
                        <p className="text-primary text-xs font-bold uppercase">Latest Advice</p>
                    </div>
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{latestAdvice}</p>
                </div>
            )}

            {/* Chat History Toggle */}
            <button
                onClick={() => setShowFullHistory(!showFullHistory)}
                className="text-white/50 hover:text-white text-xs mb-2 flex items-center gap-1 transition-colors"
            >
                <span className="material-symbols-outlined text-sm">
                    {showFullHistory ? 'expand_less' : 'expand_more'}
                </span>
                <span>{showFullHistory ? 'Hide' : 'Show'} Chat History ({messages.length})</span>
            </button>

            {/* Chat Messages */}
            {showFullHistory && (
                <div className="flex-1 space-y-3 overflow-y-auto pr-2 mb-4 max-h-[300px]">
                    {messages.map((msg, index) => (
                        <div key={index} className="flex items-start gap-3">
                            {msg.author === 'AI' && (
                                <div className="size-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-bold text-background-dark text-xs">A</div>
                            )}
                            <div className={`rounded-lg p-3 text-sm ${msg.author === 'AI' ? 'bg-white/10 text-white' : 'bg-blue-600/50 text-white ml-auto'}`}>
                                {msg.author === 'AI' && <p className="font-bold mb-1 text-xs">AI Coach</p>}
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="size-7 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-bold text-background-dark text-xs">A</div>
                            <div className="bg-white/10 rounded-lg p-3 text-white text-sm">
                                <p className="font-bold mb-1 text-xs">AI Coach</p>
                                <div className="flex items-center space-x-1.5">
                                    <span className="text-white/80">Thinking</span>
                                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-1.5 h-1.5 bg-white/80 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mt-auto flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about poker..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary text-background-dark disabled:bg-gray-500/30 disabled:text-gray-400 transition-colors hover:bg-primary/90"
                    disabled={isLoading || !input.trim()}
                >
                    <span className="material-symbols-outlined text-lg">send</span>
                </button>
            </form>
        </div>
    );
};

export default AIAssistant;
