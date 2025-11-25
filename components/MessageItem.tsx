import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, MessageRole, AttachmentType } from '../types';
import { formatTime } from '../utils';

interface MessageItemProps {
  message: Message;
  onFeedback: (id: string, feedback: 'positive' | 'negative') => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onFeedback }) => {
  const isUser = message.role === MessageRole.User;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`relative max-w-[90%] md:max-w-[75%] rounded-[24px] px-6 py-4 text-[15px] leading-relaxed shadow-sm ${
          isUser 
            ? 'bg-black text-white rounded-br-md' 
            : 'bg-white text-gray-900 rounded-bl-md border border-gray-100'
        }`}
      >
        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {message.attachments.map((att) => (
              <div key={att.id} className="relative overflow-hidden rounded-xl border border-white/20">
                {att.type === AttachmentType.Image ? (
                  <img 
                    src={att.url} 
                    alt="attachment" 
                    className="max-h-60 w-auto object-cover" 
                  />
                ) : att.type === AttachmentType.Audio ? (
                  <div className={`flex items-center gap-3 p-3 min-w-[160px] ${isUser ? 'bg-white/10' : 'bg-gray-50'}`}>
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                       </svg>
                    </div>
                    <span className="text-sm font-medium">Audio Clip</span>
                  </div>
                ) : (
                  <div className={`flex items-center gap-3 p-3 min-w-[160px] cursor-pointer hover:opacity-90 transition-opacity ${isUser ? 'bg-white/10' : 'bg-gray-50'}`} onClick={() => window.open(att.url, '_blank')}>
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                         <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                       </svg>
                    </div>
                    <div className="flex flex-col overflow-hidden max-w-[140px]">
                       <span className={`text-sm font-medium truncate ${isUser ? 'text-white' : 'text-gray-900'}`} title={att.name}>{att.name || "Document.pdf"}</span>
                       <span className={`text-xs ${isUser ? 'text-white/60' : 'text-gray-500'}`}>PDF Document</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text Content */}
        <div className={`prose max-w-none break-words ${isUser ? 'prose-invert' : 'prose-slate'}`}>
           <ReactMarkdown>{message.text}</ReactMarkdown>
        </div>
        
        {message.isError && (
           <div className="mt-2 text-sm text-red-400 font-medium">
              Failed to send.
           </div>
        )}

        {/* Footer (Timestamp + Actions) */}
        {!message.isError && (
          <div className={`flex items-center gap-4 mt-2 select-none ${isUser ? 'justify-end' : 'justify-between'}`}>
             <div className={`text-[10px] ${isUser ? 'text-white/40' : 'text-gray-400'}`}>
                {formatTime(message.timestamp)}
             </div>

            {!isUser && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Feedback & Copy Actions */}
                <button 
                    onClick={handleCopy}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    title="Copy"
                >
                    {copied ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                    )}
                </button>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageItem;