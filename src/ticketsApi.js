import { supabase } from "./supabaseClient";

export async function loadTickets() {
  const { data: tickets, error: ticketsError } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (ticketsError) throw ticketsError;

  const { data: comments, error: commentsError } = await supabase
    .from("ticket_comments")
    .select("*")
    .order("created_at", { ascending: true });

  if (commentsError) throw commentsError;

  return tickets.map((ticket) => ({
    ...ticket,

    comments: comments
      .filter((comment) => comment.ticket_id === ticket.id)
      .map((comment) => ({
        id: comment.id,
        author: comment.author_name,
        author_id: comment.author_id,
        text: comment.text,
        at: comment.created_at,
      })),
  }));
}

export async function createTicket({
  title,
  description,
  category,
  priority,
  requester,
  requester_id,
}) {
  const { data, error } = await supabase
    .from("tickets")
    .insert([
      {
        title,
        description,
        category,
        priority,
        requester,
        requester_id,
        status: "Aberto",
      },
    ])
    .select();

  if (error) throw error;

  return {
    ...data[0],
    comments: [],
  };
}

export async function updateTicket(id, changes) {
  const updates = {
    ...changes,
    updated_at: new Date().toISOString(),
  };

  // Quando o chamado for resolvido, grava a data/hora
  if (changes.status === "Resolvido") {
    updates.resolved_at = new Date().toISOString();
  }

  // Se um chamado resolvido for reaberto, remove a data de resolução
  if (
    changes.status &&
    changes.status !== "Resolvido" &&
    changes.status !== "Fechado"
  ) {
    updates.resolved_at = null;
  }

  const { error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function addComment(
  ticketId,
  authorId,
  authorName,
  text
) {
  const { data, error } = await supabase
    .from("ticket_comments")
    .insert([
      {
        ticket_id: ticketId,
        author_id: authorId,
        author_name: authorName,
        text,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    author: data.author_name,
    author_id: data.author_id,
    text: data.text,
    at: data.created_at,
  };
}