import React from 'react';
import { UserProfile, ChatSession } from '../types';
import { authService } from '../services/authService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  userProfile?: UserProfile;
  chatHistory: ChatSession[];
  currentChatId: string | null;
  onLoadChat: (chat: ChatSession) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onNewChat, 
  userProfile,
  chatHistory,
  currentChatId,
  onLoadChat,
  onOpenSettings,
  onOpenProfile
}) => {
  
  const getInitials = (name?: string) => {
    if (!name) return 'GU';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel - Glassmorphism */}
      <div 
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[300px] bg-white/95 backdrop-blur-xl border-r border-white/20 shadow-2xl z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-8">
             <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-md opacity-20 rounded-full"></div>
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="relative h-9 w-auto object-contain"
                  onError={(e) => e.currentTarget.style.display = 'none'} 
                />
             </div>
             <span className="font-bold text-lg text-gray-900 tracking-tight">Learnova AI</span>
          </div>

          <button 
            onClick={onNewChat} 
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="font-semibold text-[15px]">New Chat</span>
          </button>
        </div>

        {/* Navigation / Library */}
        <div className="px-3 py-2">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 mb-2">Library</div>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-100/80 rounded-xl transition-colors text-left">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="font-medium text-sm">Media Library</span>
            </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 no-scrollbar">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-4">Recents</div>
            <div className="space-y-0.5">
                {chatHistory.length === 0 ? (
                  <div className="text-sm text-gray-400 px-4 py-2 italic">No recent chats</div>
                ) : (
                  chatHistory.map((chat) => (
                    <div 
                      key={chat.id} 
                      onClick={() => onLoadChat(chat)}
                      className={`group relative text-[14px] leading-snug cursor-pointer px-4 py-3 rounded-xl transition-all truncate ${
                        currentChatId === chat.id 
                          ? 'bg-gray-100 text-gray-900 font-semibold' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                        {chat.title}
                    </div>
                  ))
                )}
            </div>
        </div>

        {/* Footer User Profile */}
        <div className="p-4 border-t border-gray-100 bg-white/50 backdrop-blur-md">
             <div 
               onClick={onOpenProfile}
               className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-2xl transition-all shadow-sm hover:shadow-md border border-transparent hover:border-gray-100 group"
             >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-600 text-white flex items-center justify-center text-sm font-bold shadow-inner shrink-0">
                   {getInitials(userProfile?.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="font-semibold text-gray-900 text-sm truncate">{userProfile?.full_name || 'Guest User'}</div>
                   <div className="text-xs text-gray-500 truncate">{userProfile?.program || 'Tap to edit profile'}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}
                  className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.1-.44 1.35l-1 1a2.457 2.457 0 01-3.218-.086 2.457 2.457 0 01-.086-3.218l1-1c.25-.499.8-.687 1.35-.444.892.401 1.82.732 2.783.985m0-9.18a25.996 25.996 0 010-9.18M10.34 6.66a17.373 17.373 0 001.35-5.443 1.75 1.75 0 00-3.41-.692 2.458 2.458 0 00.72 2.81l1 1c.25.25.249.656 0 .906l-.907.907c-.25.25-.656.251-.906 0l-1-1a2.458 2.458 0 00-2.81-.72 1.75 1.75 0 00.692 3.41 17.375 17.375 0 005.443-1.35m0 0a25.995 25.995 0 019.18 0m-9.18 0a17.375 17.375 0 011.35 5.443 1.75 1.75 0 01-3.41.692 2.458 2.458 0 01.72-2.81l1-1c.25-.25.249-.656 0-.906l.907-.907c.25-.25.656-.251.906 0l1 1a2.458 2.458 0 012.81.72 1.75 1.75 0 01-.692-3.41 17.373 17.373 0 01-5.443 1.35" />
                  </svg>
                </button>
             </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;