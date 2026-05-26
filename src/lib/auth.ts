import { supabase } from './supabase';

export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  const user = data.user;

  if (!user) {
    throw new Error(
      'Conta criada, mas ainda precisa de confirmação por email. Verifica a tua caixa de entrada ou desativa a confirmação de email no Supabase durante o desenvolvimento.'
    );
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    name,
  });

  if (profileError) {
    throw profileError;
  }

  return user;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data.user;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}