import React, { useState, useRef, useEffect } from 'react';
import { Attachment, AttachmentType } from '../types';
import { generateId, fileToBase64 } from '../utils';

interface InputAreaProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  isLoading: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');
      const isPdf = file.type === 'application/pdf';

      if (!isImage && !isAudio && !isPdf) {
        alert("Only image, audio, and PDF files are supported.");
        return;
      }

      setIsUploading(true);

      try {
        const base64 = await fileToBase64(file);
        let type = AttachmentType.Image;
        if (isAudio) type = AttachmentType.Audio;
        if (isPdf) type = AttachmentType.PDF;

        const newAttachment: Attachment = {
          id: generateId(),
          type: type,
          url: URL.createObjectURL(file),
          base64: base64,
          mimeType: file.type,
          name: file.name
        };
        setAttachments(prev => [...prev, newAttachment]);
      } catch (err) {
        console.error("Error reading file", err);
      } finally {
        setIsUploading(false);
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const handleSubmit = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading || isUploading) return;
    onSend(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasContent = text.trim().length > 0 || attachments.length > 0;
  const isSendDisabled = !hasContent || isLoading || isUploading;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      
      {/* Attachments Preview - Floating Cards */}
      {(attachments.length > 0 || isUploading) && (
        <div className="flex gap-3 mb-4 overflow-x-auto py-2 scroll-smooth no-scrollbar">
          {attachments.map(att => (
            <div key={att.id} className="relative group shrink-0 transform hover:-translate-y-1 transition-transform">
              {att.type === AttachmentType.Image ? (
                <img src={att.url} alt="preview" className="h-16 w-16 object-cover rounded-2xl shadow-sm border border-gray-100" />
              ) : att.type === AttachmentType.Audio ? (
                <div className="h-16 w-16 bg-white flex flex-col items-center justify-center rounded-2xl shadow-sm border border-gray-100 text-purple-500">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                   </svg>
                </div>
              ) : (
                <div className="h-16 w-16 bg-white flex flex-col items-center justify-center rounded-2xl shadow-sm border border-gray-100 text-red-500 p-1">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mb-1">
                     <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                     <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                   </svg>
                   <span className="text-[8px] font-medium text-gray-500 truncate w-full text-center leading-none">{att.name}</span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(att.id)}
                className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full p-1 shadow-md hover:bg-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
          
          {isUploading && (
             <div className="relative shrink-0 h-16 w-16 bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-100">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
             </div>
          )}
        </div>
      )}

      {/* Input Bar - Floating Effect */}
      <div className="flex items-end gap-3">
        
        {/* Plus Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors shadow-sm"
          title="Attach file"
          disabled={isUploading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*,audio/*,application/pdf"
          onChange={handleFileSelect}
        />

        {/* Input Field Capsule */}
        <div className="flex-1 bg-white rounded-[26px] flex items-end px-5 py-2.5 relative shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 transition-shadow focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask Learnova AI..."
            rows={1}
            disabled={isUploading}
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 border-none focus:ring-0 resize-none max-h-[120px] py-2.5 text-[16px] leading-6 no-scrollbar"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={isSendDisabled}
          className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
            !isSendDisabled
              ? 'bg-black text-white hover:bg-gray-800 hover:scale-105 hover:shadow-lg'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
           {isLoading || isUploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
           ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l7.5 7.5a.75.75 0 11-1.06 1.06l-6.22-6.22V21a.75.75 0 01-1.5 0V4.81l-6.22 6.22a.75.75 0 11-1.06-1.06l7.5-7.5z" clipRule="evenodd" />
              </svg>
           )}
        </button>
      </div>
    </div>
  );
};

export default InputArea;