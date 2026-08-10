import {
  FunctionsHttpError,
  FunctionsRelayError,
  FunctionsFetchError,
} from "@supabase/supabase-js";

import { supabase } from "./supabaseClient";

function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@chamados.com.br`;
}

function usernameToOldEmail(username) {
  return `${username.trim().toLowerCase()}@chamados.local`;
}

export async function signUp(username, password, name) {
  const email = usernameToEmail(username);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        name,
        role: "Funcionário",
      });

    if (profileError) {
      throw profileError;
    }
  }

  return data;
}

export async function signIn(username, password) {
  const cleanUsername = username.trim().toLowerCase();

  // Primeiro tenta a conta no padrão novo
  let { data, error } = await supabase.auth.signInWithPassword({
    email: `${cleanUsername}@chamados.com.br`,
    password,
  });

  // Se falhar, tenta a conta antiga
  if (error) {
    const oldResult = await supabase.auth.signInWithPassword({
      email: `${cleanUsername}@chamados.local`,
      password,
    });

    data = oldResult.data;
    error = oldResult.error;
  }

  if (error) throw error;

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export function onAuthStateChange(callback) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session);
    }
  );

  return subscription;
}

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data;
}

export async function createUserByAdmin({
  name,
  username,
  password,
  role = "Funcionário",
}) {
  const { data, error } = await supabase.functions.invoke(
    "hyper-processor",
    {
      body: {
        name,
        username,
        password,
        role,
      },
    }
  );

  if (error) {
    if (error instanceof FunctionsHttpError) {
      try {
        const errorBody = await error.context.json();

        throw new Error(
          errorBody?.error ||
            errorBody?.message ||
            "A função recusou a criação do usuário."
        );
      } catch (parseError) {
        if (
          parseError instanceof Error &&
          parseError.message !== "Unexpected end of JSON input"
        ) {
          throw parseError;
        }

        throw new Error(
          "Não foi possível criar o usuário."
        );
      }
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error(
        "Erro de comunicação com a Edge Function."
      );
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error(
        "Não foi possível acessar a função de criação de usuários."
      );
    }

    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function loadUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, role, created_at")
    .order("name", { ascending: true });

  if (error) throw error;

  return data;
}


export async function updateUserRole(userId, role) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}