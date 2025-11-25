import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: UserProfile;
  onUpdateProfile: (data: Partial<UserProfile>) => void;
}

const UNIVERSITIES = [
  "University of Zambia (UNZA)",
  "Copperbelt University (CBU)",
  "Mulungushi University (MU)",
  "Kwame Nkrumah University (KNU)",
  "Mukuba University",
  "Chalimbana University (CHAU)",
  "Levy Mwanawasa Medical University (LMMU)",
  "Kapasa Makasa University",
  "Palabana University",
  "Other"
];

const PROGRAMS = [
  "Bachelor in Economics",
  "Bachelor in Computer Science",
  "Bachelor in Business Administration",
  "Bachelor in Engineering",
  "Bachelor in Psychology",
  "Bachelor in Nursing",
  "Bachelor in Law",
  "Other"
];

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userProfile, onUpdateProfile }) => {
  const [university, setUniversity] = useState('');
  const [program, setProgram] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setUniversity(userProfile.university || '');
      setProgram(userProfile.program || '');
    }
  }, [userProfile]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateProfile({ university, program });
    setIsSaving(false);
    setIsEditing(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'GU';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-6">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>

        <div className="flex flex-col items-center mb-6">
           <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-4">
              {getInitials(userProfile?.full_name)}
           </div>
           <h2 className="text-xl font-bold text-gray-900">{userProfile?.full_name || 'Guest User'}</h2>
           <p className="text-sm text-gray-500">{userProfile?.email || 'Sign in to sync your progress'}</p>
        </div>

        <div className="space-y-4">
           <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 block">Academic Profile</label>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  {isEditing ? (
                    <div className="space-y-3">
                       <div>
                          <label className="text-xs text-gray-500 block mb-1">University</label>
                          <div className="relative">
                            <select 
                              value={university} 
                              onChange={(e) => setUniversity(e.target.value)}
                              className="w-full rounded-lg border-gray-200 text-sm py-2 px-3 appearance-none bg-white border"
                            >
                               <option value="">Select University</option>
                               {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                       </div>
                       <div>
                          <label className="text-xs text-gray-500 block mb-1">Program</label>
                          <div className="relative">
                            <select 
                              value={program} 
                              onChange={(e) => setProgram(e.target.value)}
                              className="w-full rounded-lg border-gray-200 text-sm py-2 px-3 appearance-none bg-white border"
                            >
                               <option value="">Select Program</option>
                               {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </div>
                       </div>
                       <button 
                         onClick={handleSave}
                         disabled={isSaving}
                         className="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex justify-center items-center"
                       >
                         {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         ) : 'Save Changes'}
                       </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                       <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {userProfile?.university || 'No university set'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {userProfile?.program || 'No program set'}
                          </p>
                       </div>
                       {userProfile && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                        >
                            Edit
                        </button>
                       )}
                    </div>
                  )}
              </div>
           </div>
        </div>
        
        {!userProfile && (
           <div className="mt-6 text-center">
             <p className="text-xs text-gray-400">Sign in to unlock full profile features.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;