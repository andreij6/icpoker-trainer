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
    /** Indicates whether the AI is currently processing a message. */
    isLoading: boolean;
}

/**
 * A chat component that allows the user to interact with the AI coach.
 *
 * This component displays the conversation history and provides an input field for the user
 * to send new messages. It also shows a loading indicator when the AI is thinking.
 *
 * @param {AIAssistantProps} props The props for the component.
 */
const AIAssistant: React.FC<AIAssistantProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
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

    return (
        <div className="w-full bg-background-dark/50 rounded-xl h-[300px] flex flex-col p-4 border border-white/10">
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                {messages.map((msg, index) => (
                     <div key={index} className="flex items-start gap-3">
                        {msg.author === 'AI' && (
                            <div className="size-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-bold text-background-dark">A</div>
                        )}
                        <div className={`rounded-lg p-3 text-white text-sm ${msg.author === 'AI' ? 'bg-white/10' : 'bg-blue-600/50 ml-auto'}`}>
                            {msg.author === 'AI' && <p className="font-bold mb-1">AI Coach</p>}
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex items-start gap-3">
                        <div className="size-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center font-bold text-background-dark">A</div>
                        <div className="bg-white/10 rounded-lg p-3 text-white text-sm">
                            <p className="font-bold mb-1">AI Coach</p>
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
             <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question or type your action..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="flex items-center justify-center rounded-lg h-10 w-10 bg-primary text-background-dark disabled:bg-gray-500/30 disabled:text-gray-400 transition-colors"
                    disabled={isLoading}
                >
                    <span className="material-symbols-outlined text-lg">send</span>
                </button>
            </form>
        </div>
    );
};

export default AIAssistant;