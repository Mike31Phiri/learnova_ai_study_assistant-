import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onClearHistory }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 gap-6">
          <button 
            onClick={() => setActiveTab('general')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'general' 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('data')}
            className={`py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'data' 
                ? 'border-black text-black' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Data Controls
          </button>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">Theme</label>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <span className="text-gray-600 text-sm">System Default</span>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition"/>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Dark mode coming soon.</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">Language</label>
                <select className="w-full p-3 rounded-xl bg-gray-50 border-gray-100 text-sm focus:ring-black focus:border-black">
                  <option>English (US)</option>
                  <option disabled>French (Coming Soon)</option>
                  <option disabled>Spanish (Coming Soon)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                <h3 className="text-sm font-bold text-red-900 mb-1">Clear all chats</h3>
                <p className="text-xs text-red-700/80 mb-4">
                  This will permanently delete your chat history from this device. This action cannot be undone.
                </p>
                <button 
                  onClick={() => {
                    if(confirm('Are you sure you want to delete all history?')) {
                      onClearHistory();
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete all history
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                 <h3 className="text-sm font-bold text-gray-900 mb-1">Export Data</h3>
                 <p className="text-xs text-gray-500 mb-4">Download a JSON file of your current conversations.</p>
                 <button className="text-sm font-medium text-black hover:underline">Request Export</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;