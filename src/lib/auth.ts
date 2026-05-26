import { supabase } from './supabase';

const INTERNAL_EMAIL_DOMAIN = 'mundial-palpites.local';

export function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '');
}

export function usernameToInternalEmail(username: string) {
  const cleanUsername = normalizeUsername(username);

  if (!cleanUsername) {
    throw new Error('Indica um username válido.');
  }

  return `${cleanUsername}@${INTERNAL_EMAIL_DOMAIN}`;
}

export function loginIdentifierToEmail(identifier: string) {
  const cleanIdentifier = identifier.trim().toLowerCase();

  if (!cleanIdentifier) {
    throw new Error('Indica o username ou email.');
  }

  if (cleanIdentifier.includes('@')) {
    return cleanIdentifier;
  }

  return usernameToInternalEmail(cleanIdentifier);
}

export async function signIn(params: {
  identifier: string;
  password: string;
}) {
  const email = loginIdentifierToEmail(params.identifier);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: params.password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUp(params: {
  name: string;
  username: string;
  password: string;
  timezone: string;
}) {
  const cleanName = params.name.trim();
  const cleanUsername = normalizeUsername(params.username);

  if (!cleanName) {
    throw new Error('Indica o teu nome.');
  }

  if (!cleanUsername) {
    throw new Error('Indica um username válido.');
  }

  if (params.password.length < 6) {
    throw new Error('A password deve ter pelo menos 6 caracteres.');
  }

  const email = usernameToInternalEmail(cleanUsername);

  const { data, error } = await supabase.auth.signUp({
    email,
    password: params.password,
    options: {
      data: {
        name: cleanName,
        username: cleanUsername,
      },
    },
  });

  if (error) {
    throw error;
  }

  const userId = data.user?.id;

  if (!userId) {
    throw new Error('Não foi possível criar o utilizador.');
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    name: cleanName,
    username: cleanUsername,
    is_admin: false,
    timezone: params.timezone || 'Europe/Lisbon',
    account_status: 'active',
  });

  if (profileError) {
    throw profileError;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}