import React, { useState, useRef, useEffect } from 'react';
import { Message, MessageRole, Attachment, UserProfile, ChatSession } from './types';
import { sendMessageToGemini, generateChatTitle } from './services/geminiService';
import { generateId } from './utils';
import MessageItem from './components/MessageItem';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import Auth from './components/Auth';
import { authService } from './services/authService';
import { dbService } from './services/dbService';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false); // Can be used if we want to force auth later
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Auth & Data
  useEffect(() => {
    // 1. Check Session
    authService.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        loadGuestData();
      }
    });

    // 2. Listen for Auth Changes
    const { subscription } = authService.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserData(session.user.id);
      } else {
        setUserProfile(undefined);
        setChatHistory([]);
        setMessages([]);
        setCurrentChatId(null);
        loadGuestData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    // Fetch Profile
    const { data: profile } = await authService.getUserProfile(userId);
    if (profile) {
      setUserProfile({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        university: profile.university,
        program: profile.program,
      });
    }

    // Fetch Chats
    const chats = await dbService.getChats(userId);
    setChatHistory(chats);
  };

  const loadGuestData = () => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse local chat history");
      }
    }
  };

  // Persist Guest Data
  useEffect(() => {
    if (!session) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory, session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    const userMessageId = generateId();
    const userMessage: Message = {
      id: userMessageId,
      role: MessageRole.User,
      text,
      attachments,
      timestamp: Date.now(),
    };

    // Optimistic UI Update
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    let activeChatId = currentChatId;
    let isNewChat = false;

    // --- CHAT SESSION MANAGEMENT ---
    if (!activeChatId) {
      isNewChat = true;
      if (session?.user) {
        // DB: Create new chat
        const id = await dbService.createChat(session.user.id, "New Conversation");
        if (id) activeChatId = id;
        else activeChatId = generateId(); // Fallback
      } else {
        // Local: Create new chat ID
        activeChatId = generateId();
      }
      setCurrentChatId(activeChatId);
    }

    // --- MESSAGE PERSISTENCE (USER) ---
    if (session?.user && activeChatId) {
      await dbService.addMessage(activeChatId, userMessage);
    }

    // Update History State
    if (isNewChat) {
      const newSession: ChatSession = {
        id: activeChatId!,
        title: "New Conversation...",
        messages: newMessages,
        timestamp: Date.now()
      };
      setChatHistory(prev => [newSession, ...prev]);

      // Title Generation
      const titleContext = text || (attachments.length > 0 ? "Analysis of attached document" : "New Study Session");
      generateChatTitle(titleContext).then(async (creativeTitle) => {
        setChatHistory(prev => prev.map(chat => 
          chat.id === activeChatId 
            ? { ...chat, title: creativeTitle } 
            : chat
        ));
        if (session?.user && activeChatId) {
          await dbService.updateChatTitle(activeChatId, creativeTitle);
        }
      });
    } else {
      setChatHistory(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: newMessages, timestamp: Date.now() } // Note: For DB mode, messages here might be partial, but keeps UI snappy
          : chat
      ));
    }

    try {
      // --- AI GENERATION ---
      const responseText = await sendMessageToGemini(text, attachments, userProfile);
      
      const modelMessage: Message = {
        id: generateId(),
        role: MessageRole.Model,
        text: responseText,
        timestamp: Date.now(),
      };

      const finalMessages = [...newMessages, modelMessage];
      setMessages(finalMessages);

      // --- MESSAGE PERSISTENCE (AI) ---
      if (session?.user && activeChatId) {
        await dbService.addMessage(activeChatId, modelMessage);
      }

      setChatHistory(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { ...chat, messages: finalMessages, timestamp: Date.now() }
          : chat
      ));

    } catch (error) {
      console.error("Failed to send message", error);
      const errorMessage: Message = {
        id: generateId(),
        role: MessageRole.Model,
        text: "I'm sorry, something went wrong. Please try again.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (id: string, feedback: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === id) {
        return { ...msg, feedback: msg.feedback === feedback ? undefined : feedback };
      }
      return msg;
    }));
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setIsSidebarOpen(false);
  };

  const handleLoadChat = async (chat: ChatSession) => {
    setCurrentChatId(chat.id);
    setIsSidebarOpen(false);
    
    if (session?.user) {
      setIsLoading(true);
      const dbMessages = await dbService.getMessages(chat.id);
      setMessages(dbMessages);
      setIsLoading(false);
    } else {
      setMessages(chat.messages);
    }
  };

  const handleClearHistory = async () => {
    if (session?.user) {
      await dbService.clearHistory(session.user.id);
    } else {
      localStorage.removeItem('chatHistory');
    }
    setChatHistory([]);
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (userProfile && session?.user) {
        const updated = { ...userProfile, ...data };
        setUserProfile(updated);
        await authService.updateUserProfile(session.user.id, data);
    }
  };

  if (!session && showAuth) {
    return <Auth onAuthSuccess={() => setShowAuth(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-gray-900 font-sans relative overflow-hidden">
      
      {/* Background Gradient Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-200 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-100 rounded-full blur-[140px]"></div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onNewChat={handleNewChat}
        userProfile={userProfile}
        chatHistory={chatHistory}
        currentChatId={currentChatId}
        onLoadChat={handleLoadChat}
        onOpenSettings={() => { setIsSidebarOpen(false); setIsSettingsOpen(true); }}
        onOpenProfile={() => { 
          if(session) {
            setIsSidebarOpen(false); 
            setIsProfileOpen(true);
          } else {
            // For guests, we still want to allow profile editing (local)
            // or we could show auth. Since user requested "MVP remove login",
            // let's assume we allow editing local profile or just show profile modal.
            // But previous instruction said "remove the login and sign up stuffs".
            // So we open profile modal in read/edit mode for guest (local storage logic handled inside modal/App if needed, 
            // though current ProfileModal saves to DB. Guest editing isn't fully wired to local storage yet but sticking to UI request).
            // Actually, let's just open the profile modal for now, or do nothing if strictly no auth.
            // Let's open ProfileModal, user can see "Guest User".
             setIsSidebarOpen(false); 
             setIsProfileOpen(true);
          }
        }}
      />
      
      {showAuth && (
         <div className="fixed inset-0 z-[70] bg-white">
            <button onClick={() => setShowAuth(false)} className="absolute top-4 left-4 p-2 text-gray-500">
               Cancel
            </button>
            <Auth onAuthSuccess={() => setShowAuth(false)} />
         </div>
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onClearHistory={handleClearHistory}
      />

      <ProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Header */}
      <header className="flex-none pt-4 px-4 pb-2 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100/50">
        <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
          <button 
             onClick={() => setIsSidebarOpen(true)}
             className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
          >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
             </svg>
          </button>

          <div className="font-bold text-lg text-gray-900 tracking-tight">
            Learnova AI
          </div>

          <button 
              onClick={handleNewChat}
              className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
              title="New Chat"
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 scroll-smooth no-scrollbar z-10">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
               
               <div className="relative mb-8 group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-purple-400 to-blue-400 blur-[40px] opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
                 <img 
                   src="/logo.png" 
                   alt="Logo" 
                   className="relative h-24 w-auto object-contain drop-shadow-sm" 
                   onError={(e) => e.currentTarget.style.display = 'none'}
                 />
               </div>

               <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                 {userProfile ? `Welcome, ${userProfile.full_name?.split(' ')[0]}` : 'Ace your studies'}
               </h2>
               <p className="text-lg text-gray-500 mb-10 max-w-lg mx-auto leading-relaxed">
                 Turn complex topics into clear concepts using proven methods like First Principles and Mind Maps.
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                  {[
                    { title: "🧠 Core Concepts", desc: "Break it down with First Principles", prompt: "Break down the core concepts of [Topic] using First Principles." },
                    { title: "🗺️ Mind Map", desc: "Visualize connections", prompt: "Create a text-based Mind Map for [Topic] to show how everything connects." },
                    { title: "🌍 Real World", desc: "Connect theory to reality", prompt: "Give me a real-world example of [Topic] so I never forget it." },
                    { title: "📝 Summarize", desc: "Attach a PDF to summarize", prompt: "Analyze this document and extract the key exam topics." }
                  ].map((item, idx) => (
                    <button 
                       key={idx}
                       onClick={() => handleSendMessage(item.prompt, [])}
                       className="p-5 bg-white border border-gray-100 rounded-2xl text-left hover:shadow-lg hover:border-gray-200 transition-all transform hover:-translate-y-1 group"
                    >
                        <span className="block text-base font-bold text-gray-900 mb-1">{item.title}</span>
                        <span className="block text-sm text-gray-500 group-hover:text-gray-700">{item.desc}</span>
                    </button>
                  ))}
               </div>

               {!session && (
                 <div className="mt-8">
                    {/* Removed log in text as requested for MVP guest mode focus */}
                 </div>
               )}
            </div>
          ) : (
            <div className="py-4">
              {messages.map((msg) => (
                <MessageItem 
                  key={msg.id} 
                  message={msg} 
                  onFeedback={handleFeedback}
                />
              ))}
              {isLoading && (
                  <div className="flex w-full justify-start pl-6">
                    <div className="flex items-center gap-2 p-3 bg-white border border-gray-100 rounded-[20px] shadow-sm">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>
      </main>

      {/* Footer Input */}
      <footer className="flex-none bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent pt-4 pb-2 z-20">
         <InputArea onSend={handleSendMessage} isLoading={isLoading} />
      </footer>
    </div>
  );
};

export default App;