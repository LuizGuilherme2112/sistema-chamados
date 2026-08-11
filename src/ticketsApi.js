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

  // Carrega os anexos dos chamados
  const { data: attachments, error: attachmentsError } = await supabase
    .from("ticket_attachments")
    .select("*")
    .order("uploaded_at", { ascending: true });

  if (attachmentsError) throw attachmentsError;

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

    attachments: attachments
      .filter((attachment) => attachment.ticket_id === ticket.id)
      .map((attachment) => ({
        id: attachment.id,
        file_name: attachment.file_name,
        file_path: attachment.file_path,
        uploaded_by: attachment.uploaded_by,
        uploaded_at: attachment.uploaded_at,
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
    attachments: [],
  };
}

// ======================================================
// ANEXOS
// ======================================================

export async function uploadTicketAttachment(
  ticketId,
  userId,
  file
) {
  if (!file) return null;

  // Aceita somente PNG
  if (file.type !== "image/png") {
    throw new Error("Apenas imagens PNG são permitidas.");
  }

  // Máximo de 5 MB
  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error("O anexo deve ter no máximo 5 MB.");
  }

  // Remove caracteres problemáticos do nome
  const safeName = file.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  // Exemplo:
  // ticket-id/uuid-print.png
  const filePath =
    `${ticketId}/${crypto.randomUUID()}-${safeName}`;

  // Envia o arquivo para o Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("ticket-attachments")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  // Registra o arquivo na tabela ticket_attachments
  const { data, error: attachmentError } = await supabase
    .from("ticket_attachments")
    .insert({
      ticket_id: ticketId,
      file_name: file.name,
      file_path: filePath,
      uploaded_by: userId,
    })
    .select()
    .single();

  // Se falhar ao registrar no banco,
  // remove o arquivo que acabou de subir
  if (attachmentError) {
    await supabase.storage
      .from("ticket-attachments")
      .remove([filePath]);

    throw attachmentError;
  }

  return data;
}

// Como o bucket é privado, gera uma URL temporária
// para o usuário autorizado visualizar o print.
export async function getTicketAttachmentUrl(filePath) {
  const { data, error } = await supabase.storage
    .from("ticket-attachments")
    .createSignedUrl(filePath, 600);

  if (error) {
    throw error;
  }

  return data.signedUrl;
}

// ======================================================
// ATUALIZAÇÃO DO CHAMADO
// ======================================================

export async function updateTicket(id, changes) {
  const updates = {
    ...changes,
    updated_at: new Date().toISOString(),
  };

  // Quando o chamado for resolvido, grava a data/hora
  if (changes.status === "Resolvido") {
    updates.resolved_at = new Date().toISOString();
  }

  // Se um chamado resolvido for reaberto,
  // remove a data de resolução
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

// ======================================================
// COMENTÁRIOS
// ======================================================

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