import React, { useState } from 'react';
import { authService } from '../services/authService';

interface AuthProps {
  onAuthSuccess: () => void;
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

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [program, setProgram] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // 1. Sign Up
        const { data, error } = await authService.signUp(email, password, {
          full_name: fullName,
          university: university,
          program: program,
        });
        
        if (error) throw new Error(error.message);

        // 2. If session is missing (due to Supabase config), try to Auto-Sign In immediately
        if (!data.session) {
           const { data: signInData, error: signInError } = await authService.signIn(email, password);
           if (signInError) {
             // If auto-login fails, it usually means email confirmation is strictly enforced by Supabase
             throw new Error("Account created, but automatic login failed. Please check if email confirmation is required.");
           }
        }

      } else {
        // Standard Sign In
        const { error } = await authService.signIn(email, password);
        if (error) throw new Error(error.message);
      }
      
      // Success - Close Modal
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "block w-full rounded-xl border-0 py-3.5 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 bg-gray-50 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black focus:bg-white transition-all duration-200 sm:text-sm sm:leading-6";
  const labelClasses = "block text-sm font-semibold leading-6 text-gray-900 mb-1.5 ml-1";

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 bg-white h-screen overflow-y-auto">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        
        {/* Logo Section */}
        {!logoError ? (
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.png" 
              alt="App Logo" 
              className="h-24 w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          </div>
        ) : (
          <div className="mx-auto h-12 w-12 bg-black rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
          </div>
        )}

        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          {isSignUp ? 'Join to access your personalized study materials' : 'Sign in to continue your learning journey'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          
          {isSignUp && (
            <>
              <div>
                <label htmlFor="fullName" className={labelClasses}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={isSignUp}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClasses}
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div>
                <label htmlFor="university" className={labelClasses}>
                  University / College
                </label>
                <div className="relative">
                  <select
                    id="university"
                    name="university"
                    required={isSignUp}
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    <option value="">Select your university</option>
                    {UNIVERSITIES.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="program" className={labelClasses}>
                  Program / Course
                </label>
                 <div className="relative">
                  <select
                    id="program"
                    name="program"
                    required={isSignUp}
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                    <option value="">Select your program</option>
                    {PROGRAMS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className={labelClasses}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
              placeholder="e.g. you@example.com"
            />
          </div>

          <div>
             <div className="flex items-center justify-between">
              <label htmlFor="password" className={labelClasses}>
                Password
              </label>
              {!isSignUp && (
                <div className="text-sm">
                  <a href="#" className="font-semibold text-gray-500 hover:text-black transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-black px-3 py-3.5 text-sm font-bold leading-6 text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                 </div>
              ) : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="font-bold leading-6 text-black hover:text-gray-700 underline underline-offset-4 transition-colors"
          >
            {isSignUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;