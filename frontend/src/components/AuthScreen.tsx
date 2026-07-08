import React, { useState } from 'react';
import { supabase } from '../supabase';

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState('Male');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
              username: nickname || email.split('@')[0],
              nickname: nickname || email.split('@')[0],
              gender: gender,
              country: country,
            },
          },
        });
        if (signUpError) throw signUpError;
        setSuccessMsg('Registration successful! Please check your email for confirmation.');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden select-none bg-gradient-to-tr from-[#fcfbf9] via-[#f7f4ed] to-[#f0eae1]">
      {/* Background radial soft blurs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-aurora-gold/5 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-amber-glow/5 blur-[150px] -z-10" />

      {/* Main Split-Pane Card */}
      <div className="w-full max-w-5xl min-h-[480px] bg-[#f8f9fa] rounded-[32px] border border-white/20 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Ambient Aurora Showcase (Dark) */}
        <div className="w-full md:w-1/2 bg-[#000000] relative p-8 md:p-10 flex flex-col justify-between overflow-hidden">
          {/* Custom Ambient Aurora Glow (Orange / Amber / White) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
          <div className="absolute -bottom-20 -left-20 w-[320px] h-[320px] rounded-full bg-[#ff5e00]/30 opacity-40 blur-[80px] z-10" />
          <div className="absolute bottom-10 left-10 w-[220px] h-[220px] rounded-full bg-amber-500/25 opacity-30 blur-[90px] z-10" />
          
          {/* Vertical light streaks mimicking the curtain look */}
          <div className="absolute inset-x-0 bottom-0 top-1/3 opacity-30 flex justify-around pointer-events-none z-10">
            <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#ff5e00]/40 to-transparent blur-[2px]" />
            <div className="w-[1.5px] h-full bg-gradient-to-b from-transparent via-amber-500/30 to-transparent blur-[3px]" />
            <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-[#ff5e00]/20 to-transparent blur-[1.5px]" />
            <div className="w-[2px] h-full bg-gradient-to-b from-transparent via-white/15 to-transparent blur-[4px]" />
          </div>

          {/* Logo / Header tag */}
          <div className="relative z-20 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-aurora-gold to-amber-glow flex items-center justify-center text-white font-display font-bold text-sm shadow-md">
              A
            </div>
            <span className="font-display text-sm font-bold text-white/95 tracking-wide">
              Aurora Research
            </span>
          </div>

          {/* Bold Feature Text */}
          <div className="relative z-20 mt-16 md:mt-0">
            <h2 className="font-sans text-2xl md:text-3xl font-bold leading-tight text-white tracking-tight">
              Research and write with the power of collaborative AI.
            </h2>
            <p className="text-[11px] text-white/50 font-sans tracking-wide mt-2.5 leading-relaxed max-w-sm">
              Deploying a sequential orchestration of intelligent researchers, editors, and fact-checkers to compile professional documents in seconds.
            </p>
          </div>

          {/* Footer watermark */}
          <div className="relative z-20 text-[9px] text-white/20 font-mono tracking-widest uppercase mt-6 md:mt-0">
            Aurora Agentic Crew v1.0
          </div>
        </div>

        {/* Right Side: Clean Form Section (Light) */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-[#f3f4f6]">
          
          {/* Orange Sun Logo Icon */}
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-[#ff5e00]">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M4.93 4.93l1.41 1.41" />
              <path d="M17.66 17.66l1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="M6.34 17.66l-1.41 1.41" />
              <path d="M19.07 4.93l-1.41 1.41" />
            </svg>
          </div>

          <div className="mb-4">
            <h3 className="font-sans text-2xl font-bold text-gray-900 tracking-tight leading-tight">
              {isSignUp ? 'Get Started' : 'Welcome Back'}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {isSignUp 
                ? "Welcome to Aurora — Let's get started" 
                : 'Sign in to access your reports and dashboard'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-sans">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff5e00] focus:ring-1 focus:ring-[#ff5e00] transition-all text-xs font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-sans">
                    Nickname / Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Your Nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff5e00] focus:ring-1 focus:ring-[#ff5e00] transition-all text-xs font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-sans">
                      Gender
                    </label>
                    <select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-[#ff5e00] focus:ring-1 focus:ring-[#ff5e00] transition-all text-xs font-sans appearance-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-sans">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="United States"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff5e00] focus:ring-1 focus:ring-[#ff5e00] transition-all text-xs font-sans"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-sans">
                Your email
              </label>
              <input
                type="email"
                required
                placeholder="hi@aurora.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff5e00] focus:ring-1 focus:ring-[#ff5e00] transition-all text-xs font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 font-sans">
                {isSignUp ? 'Create new password' : 'Enter your password'}
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#ffffff] border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff5e00] focus:ring-1 focus:ring-[#ff5e00] transition-all text-xs font-sans"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 font-medium font-sans animate-fade-in">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 font-medium font-sans animate-fade-in">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ff5e00] hover:bg-[#e65500] text-white font-semibold rounded-xl text-xs shadow-md shadow-orange-500/15 hover:scale-[1.002] active:scale-[0.998] disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4 font-sans"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                'Create a new account'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Toggle Switch */}
          <div className="mt-4 text-center text-xs text-gray-500 font-sans">
            {isSignUp ? (
              <>
                Already have account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(''); }}
                  className="font-bold text-[#ff5e00] hover:underline focus:outline-none cursor-pointer"
                >
                  Login
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(''); }}
                  className="font-bold text-[#ff5e00] hover:underline focus:outline-none cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}