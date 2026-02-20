import { supabaseClient } from '../config/supabase.js';

/**
 * Register a new user with Freelancer role
 * @param {string} email - User email
 * @param {string} password - User password (min 6 chars)
 * @param {string} fullName - User's full name
 * @returns {Promise<Object>} - User object with session
 * @throws {Error} - On validation or registration errors
 */
export async function register(email, password, fullName) {
  if (!email || !password || !fullName) {
    throw new Error('Email, password, and full name are required');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User object with session
 * @throws {Error} - On authentication errors
 */
export async function login(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Logout current user and clear session
 * @returns {Promise<void>}
 * @throws {Error} - On logout errors
 */
export async function logout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw new Error(error.message);
}

/**
 * Get currently authenticated user with profile data
 * @returns {Promise<Object|null>} - User object with role and profile, or null
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  
  if (error || !user) return null;

  // Fetch profile data including role
  const { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
    return { ...user, role: 'freelancer', full_name: 'User' };
  }

  return {
    ...user,
    ...profile
  };
}

/**
 * Get current session
 * @returns {Promise<Object|null>} - Session object or null
 */
export async function getSession() {
  const { data: { session }, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return session;
}

/**
 * Redirect to login if no authenticated user
 * @param {string} redirectUrl - URL to redirect to
 * @returns {Promise<void>}
 */
export async function redirectIfNotAuthenticated(redirectUrl = '/pages/login.html') {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = redirectUrl;
  }
}

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - Called with (event, session)
 * @returns {Object} - Subscription object with unsubscribe method
 */
export function onAuthStateChange(callback) {
  return supabaseClient.auth.onAuthStateChange(callback);
}
