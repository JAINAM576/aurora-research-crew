import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import GlassCard from './GlassCard';
import { Mail } from 'lucide-react';

interface ProfileData {
  username: string;
  full_name: string;
  avatar_url: string;
  nickname: string;
  gender: string;
  country: string;
  language: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>({
    username: '',
    full_name: '',
    avatar_url: '',
    nickname: '',
    gender: 'Female',
    country: 'United States',
    language: 'English',
  });
  const [email, setEmail] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');
      
      setEmail(user.email || '');

      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, nickname, gender, country, language, secondary_emails')
        .eq('id', user.id)
        .single();

      if (profileErr) throw profileErr;
      if (data) {
        setProfile({
          username: data.username || '',
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
          nickname: data.nickname || '',
          gender: data.gender || 'Female',
          country: data.country || 'United States',
          language: data.language || 'English',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user found');

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          username: profile.username || '',
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url || '',
          nickname: profile.nickname || '',
          gender: profile.gender || '',
          country: profile.country || '',
          language: profile.language || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateErr) throw updateErr;
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-aurora-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-none py-6">
      <div className="mb-6">
        <h2 className="font-display text-3xl font-semibold text-umber-text">Account Profile</h2>
        <p className="text-sm text-taupe-muted mt-1">Manage your account information and preferences.</p>
      </div>

      <GlassCard className="overflow-hidden shadow-xl p-0">
        <form onSubmit={handleSave}>
          {/* Header Pastel Gradient Banner */}
          <div className="w-full h-36 bg-gradient-to-r from-[#d4af37]/20 via-[#f3e8d5]/40 to-[#e5b85c]/35 border-b border-glass-border/30 relative" />

          {/* Profile Avatar Card Overlay */}
          <div className="px-8 pb-6 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-10 mb-8">
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-[#f8f9fa] shadow-md overflow-hidden flex items-center justify-center relative shrink-0 z-10">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-display text-4xl text-aurora-gold font-bold">
                    {profile.full_name ? profile.full_name[0].toUpperCase() : email[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="mb-2">
                <h3 className="font-display text-xl font-bold text-umber-text leading-tight">
                  {profile.full_name || 'Anonymous User'}
                </h3>
                <p className="text-xs text-taupe-muted mt-0.5">{email}</p>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-[0.98] shrink-0"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

          <div className="px-8 pb-8 space-y-6">
            {/* Input Grid matching Alexa Rawles Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-taupe-muted mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Full Name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/40 border border-glass-border rounded-xl text-umber-text placeholder:text-taupe-muted/40 focus:outline-none focus:border-aurora-gold focus:ring-1 focus:ring-aurora-gold/30 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-taupe-muted mb-1.5">
                  Nick Name / Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Nick Name"
                  value={profile.username}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/40 border border-glass-border rounded-xl text-umber-text placeholder:text-taupe-muted/40 focus:outline-none focus:border-aurora-gold focus:ring-1 focus:ring-aurora-gold/30 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-taupe-muted mb-1.5">
                  Gender
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/40 border border-glass-border rounded-xl text-umber-text focus:outline-none focus:border-aurora-gold focus:ring-1 focus:ring-aurora-gold/30 transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="Male" className="bg-[#fcfbf9] text-umber-text">Male</option>
                  <option value="Female" className="bg-[#fcfbf9] text-umber-text">Female</option>
                  <option value="Other" className="bg-[#fcfbf9] text-umber-text">Other</option>
                  <option value="Prefer not to say" className="bg-[#fcfbf9] text-umber-text">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-taupe-muted mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Your Country"
                  value={profile.country}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/40 border border-glass-border rounded-xl text-umber-text placeholder:text-taupe-muted/40 focus:outline-none focus:border-aurora-gold focus:ring-1 focus:ring-aurora-gold/30 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-taupe-muted mb-1.5">
                  Language
                </label>
                <input
                  type="text"
                  placeholder="Your Language"
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/40 border border-glass-border rounded-xl text-umber-text placeholder:text-taupe-muted/40 focus:outline-none focus:border-aurora-gold focus:ring-1 focus:ring-aurora-gold/30 transition-all text-sm"
                />
              </div>
            </div>

            {/* Feedback Alerts */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-600 font-medium">
                {success}
              </div>
            )}

          </div>
        </form>
      </GlassCard>
    </div>
  );
}
