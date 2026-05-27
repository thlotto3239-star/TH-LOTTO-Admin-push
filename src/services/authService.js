/**
 * Admin Auth Service
 * รวม logic auth สำหรับ Admin Panel
 */

import { supabase } from '../supabaseClient';
import logger from './logger';

/**
 * แปลง PIN 4 หลัก → SHA256(pin+phone)
 */
export async function pinToPassword(phone, pin) {
  const raw = new TextEncoder().encode(pin + phone);
  const hashBuffer = await crypto.subtle.digest('SHA-256', raw);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Admin Sign In — ตรวจ is_admin ก่อน
 */
export async function signIn(phone, pin) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${phone}@thlotto.app`,
    password: await pinToPassword(phone, pin),
  });

  if (!error && data?.user) {
    const { data: prof } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single();

    if (!prof?.is_admin) {
      await supabase.auth.signOut();
      return { data: null, error: { message: 'ไม่มีสิทธิ์เข้าใช้งาน Admin Panel' } };
    }
  }

  return { data, error };
}

/**
 * Sign out
 */
export async function signOut() {
  await supabase.auth.signOut();
}

/**
 * Fetch Admin profile (ตรวจ is_admin)
 */
export async function fetchAdminProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,member_id,full_name,phone,is_admin,status,avatar_url,admin_role,admin_permissions')
    .eq('id', userId)
    .single();

  if (error) {
    logger.error('fetchAdminProfile error:', error.message);
    throw error;
  }

  if (!data.is_admin) {
    await supabase.auth.signOut();
    throw new Error('Not an admin');
  }

  return data;
}

/**
 * Get current session
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Listen auth state changes
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

/**
 * Check permission
 */
export function hasPermission(profile, perm) {
  if (!profile) return false;
  if (profile.admin_role === 'super_admin') return true;
  const perms = profile.admin_permissions || [];
  return perms.includes('*') || perms.includes(perm);
}

/**
 * Check if super admin
 */
export function isSuperAdmin(profile) {
  return profile?.admin_role === 'super_admin';
}
