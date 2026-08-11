import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, MessageSquare, X, Wrench, Wifi, KeyRound, HelpCircle, AppWindow,
  RefreshCw, Filter, Clock, UserCircle2, Send, ChevronDown, LogOut, Lock
} from "lucide-react";
import { loadTickets, createTicket, updateTicket, addComment } from "./ticketsApi";
import { signIn, signOut, getProfile, getSession, onAuthStateChange, createUserByAdmin, loadUsers, updateUserRole } from "./authApi";

const COLORS = {
  bg: "#EEF1F4",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F9FA",
  ink: "#1A2332",
  inkMuted: "#5B6B7C",
  border: "#D7DEE5",
  teal: "#0E7C86",
  tealDark: "#0B6169",
  indigo: "#4C5FD5",
  amber: "#D98E04",
  danger: "#C1443C",
  success: "#2F9E5B",
  gray: "#8A97A5",
};

const CATEGORIES = [
  { id: "Hardware", icon: Wrench },
  { id: "Software", icon: AppWindow },
  { id: "Rede", icon: Wifi },
  { id: "Acesso", icon: KeyRound },
  { id: "Outro", icon: HelpCircle },
];

const PRIORITIES = ["Baixa", "Média", "Alta", "Urgente"];
const PRIORITY_COLOR = { Baixa: COLORS.gray, "Média": COLORS.teal, Alta: COLORS.amber, Urgente: COLORS.danger };

const STATUSES = ["Aberto", "Em andamento", "Aguardando", "Resolvido", "Fechado"];
const STATUS_COLOR = {
  Aberto: COLORS.indigo,
  "Em andamento": COLORS.teal,
  Aguardando: COLORS.amber,
  Resolvido: COLORS.success,
  Fechado: COLORS.gray,
};

const REFRESH_INTERVAL_MS = 20000;

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " +
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function ticketNumber(n) {
  return "#" + String(n).padStart(5, "0");
}

function Badge({ color, children, filled }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 12, fontWeight: 600, padding: "3px 9px", borderRadius: 20,
      color: filled ? "#fff" : color,
      background: filled ? color : color + "18",
      border: filled ? "none" : `1px solid ${color}40`,
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function CategoryIcon({ category, size = 15 }) {
  const found = CATEGORIES.find((c) => c.id === category);
  const Icon = found ? found.icon : HelpCircle;
  return <Icon size={size} strokeWidth={2} />;
}

function TicketStub({ ticket, onClick, dense }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        cursor: "pointer",
        overflow: "visible",
        transition: "border-color .15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = COLORS.inkMuted)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = COLORS.border)}
    >
      <div style={{ padding: dense ? "10px 12px" : "12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <span style={{
            fontFamily: "ui-monospace, 'SF Mono', 'Roboto Mono', monospace",
            fontSize: 11, color: COLORS.inkMuted, letterSpacing: 0.3,
          }}>
            {ticketNumber(ticket.number)}
          </span>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: PRIORITY_COLOR[ticket.priority], flexShrink: 0, marginTop: 3 }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.ink, marginTop: 4, lineHeight: 1.3 }}>
          {ticket.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: COLORS.inkMuted, fontSize: 12 }}>
          <CategoryIcon category={ticket.category} size={13} />
          <span>{ticket.category}</span>
          {ticket.assignee && (
            <>
              <span style={{ opacity: 0.4 }}>·</span>
              <UserCircle2 size={13} />
              <span>{ticket.assignee}</span>
            </>
          )}
        </div>
      </div>
      <div style={{ borderTop: `1.5px dashed ${COLORS.border}`, position: "relative" }}>
        <span style={{
          position: "absolute", left: -7, top: -7, width: 14, height: 14, borderRadius: "50%",
          background: "var(--stub-bg, #EEF1F4)", border: `1px solid ${COLORS.border}`,
        }} />
        <span style={{
          position: "absolute", right: -7, top: -7, width: 14, height: 14, borderRadius: "50%",
          background: "var(--stub-bg, #EEF1F4)", border: `1px solid ${COLORS.border}`,
        }} />
      </div>
      <div style={{ padding: "8px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Badge color={STATUS_COLOR[ticket.status]}>{ticket.status}</Badge>
        <span style={{ fontSize: 11, color: COLORS.inkMuted, display: "flex", alignItems: "center", gap: 4 }}>
          <Clock size={11} /> {fmtDate(ticket.created_at)}
        </span>
      </div>
    </div>
  );
}

function Select({ value, onChange, options, style }) {
  return (
    <div style={{ position: "relative", ...style }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", appearance: "none", fontSize: 13, fontWeight: 500,
          padding: "8px 30px 8px 10px", borderRadius: 8, border: `1px solid ${COLORS.border}`,
          background: COLORS.surface, color: COLORS.ink, cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} style={{ position: "absolute", right: 9, top: 9, color: COLORS.inkMuted, pointerEvents: "none" }} />
    </div>
  );
}

function TicketDetail({ ticket, isIT, tiUsers, onClose, onUpdate, onComment }) {
  const [commentText, setCommentText] = useState("");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(26,35,50,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
    }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.surface, borderRadius: 14, width: "100%", maxWidth: 560,
          maxHeight: "88vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: COLORS.inkMuted }}>
              {ticketNumber(ticket.number)}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink, marginTop: 2 }}>{ticket.title}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkMuted, padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "16px 22px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Badge color={STATUS_COLOR[ticket.status]} filled>{ticket.status}</Badge>
          <Badge color={PRIORITY_COLOR[ticket.priority]}>{ticket.priority}</Badge>
          <Badge color={COLORS.inkMuted}>
            <CategoryIcon category={ticket.category} size={12} /> {ticket.category}
          </Badge>
        </div>

        <div style={{ padding: "0 22px 16px", fontSize: 14, color: COLORS.ink, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {ticket.description}
        </div>

        <div style={{ padding: "0 22px 16px", fontSize: 12, color: COLORS.inkMuted }}>
          Aberto por <strong style={{ color: COLORS.ink }}>{ticket.requester}</strong> em {fmtDate(ticket.created_at)}
        </div>

        {isIT && (
          <div style={{ padding: "14px 22px", borderTop: `1px solid ${COLORS.border}`, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 140px" }}>
              <div style={{ fontSize: 11, color: COLORS.inkMuted, marginBottom: 4, fontWeight: 600 }}>STATUS</div>
              <Select value={ticket.status} onChange={(v) => onUpdate(ticket.id, { status: v })} options={STATUSES} />
            </div>
            <div style={{ flex: "1 1 100px" }}>
              <div style={{ fontSize: 11, color: COLORS.inkMuted, marginBottom: 4, fontWeight: 600 }}>PRIORIDADE</div>
              <Select value={ticket.priority} onChange={(v) => onUpdate(ticket.id, { priority: v })} options={PRIORITIES} />
            </div>
            <div style={{ flex: "1 1 140px" }}>
              <div style={{ fontSize: 11, color: COLORS.inkMuted, marginBottom: 4, fontWeight: 600 }}>RESPONSÁVEL</div>
              <Select
                value={ticket.assignee || "Não atribuído"}
                onChange={(value) =>
                  onUpdate(ticket.id, {
                    assignee: value === "Não atribuído" ? null : value,
                  })
                }
                options={[
                  "Não atribuído",
                  ...tiUsers.map((user) => user.name),
                ]}
              />
            </div>
          </div>
        )}

        <div style={{ padding: "16px 22px", borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.inkMuted, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <MessageSquare size={13} /> COMENTÁRIOS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
            {ticket.comments.length === 0 && (
              <div style={{ fontSize: 13, color: COLORS.inkMuted, fontStyle: "italic" }}>Nenhum comentário ainda.</div>
            )}
            {ticket.comments.map((c, i) => (
              <div key={i} style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.inkMuted, marginBottom: 3 }}>
                  <strong style={{ color: COLORS.ink }}>{c.author}</strong>
                  <span>{fmtDate(c.at)}</span>
                </div>
                <div style={{ fontSize: 13, color: COLORS.ink }}>{c.text}</div>
              </div>
            ))}
          </div>
          {isIT && (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && commentText.trim()) {
                    onComment(ticket, commentText.trim());
                    setCommentText("");
                  }
                }}
                placeholder="Escrever um comentário..."
                style={{
                  flex: 1, fontSize: 13, padding: "9px 12px", borderRadius: 8,
                  border: `1px solid ${COLORS.border}`, color: COLORS.ink,
                }}
              />
              <button
                onClick={() => {
                  if (commentText.trim()) {
                    onComment(ticket, commentText.trim());
                    setCommentText("");
                  }
                }}
                style={{
                  background: COLORS.teal, border: "none", borderRadius: 8, width: 38,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff",
                }}
              >
                <Send size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthField({ icon: Icon, ...props }) {
  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <Icon size={15} style={{ position: "absolute", left: 12, top: 12, color: COLORS.inkMuted }} />
      <input
        {...props}
        style={{
          width: "100%", fontSize: 14, padding: "11px 14px 11px 36px", borderRadius: 9,
          border: `1px solid ${COLORS.border}`, color: COLORS.ink,
        }}
      />
    </div>
  );
}

function AuthScreen({ onAuthed }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);

    if (!username.trim() || !password || busy) return;

    setBusy(true);

    try {
      await signIn(username.trim(), password);
      onAuthed();
    } catch (e) {
      console.error(e);

      if (e.message === "Invalid login credentials") {
        setError("Usuário ou senha incorretos.");
      } else {
        setError(e.message || "Não foi possível entrar.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: COLORS.teal, marginBottom: 6 }}>
          CENTRAL DE CHAMADOS
        </div>

        <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, marginBottom: 20 }}>
          Entrar
        </div>

        <AuthField
          icon={UserCircle2}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuário"
          autoComplete="off"
          name="login_usuario"
        />

        <AuthField
          icon={Lock}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          autoComplete="off"
          name="login_senha"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              submit();
            }
          }}
        />

        {error && (
          <div
            style={{
              background: COLORS.danger + "15",
              color: COLORS.danger,
              fontSize: 12.5,
              padding: "8px 12px",
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        <button
          disabled={busy || !username.trim() || !password}
          onClick={submit}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 9,
            border: "none",
            background: !busy && username.trim() && password ? COLORS.teal : COLORS.gray,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            cursor: busy || !username.trim() || !password ? "default" : "pointer",
          }}
        >
          {busy ? "Aguarde..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}

function NewUserForm({ onCreate, onClose }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Funcionário");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const submit = async () => {
    if (!name.trim() || !username.trim() || !password || submitting) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await onCreate({
        name: name.trim(),
        username: username.trim(),
        password,
        role,
      });
    } catch (e) {
      setFormError(e.message || "Não foi possível criar o usuário.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink }}>Cadastrar usuário</div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkMuted }}>
          <X size={17} />
        </button>
      </div>

      <AuthField
        icon={UserCircle2}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome completo"
        autoComplete="off"
        name="novo_nome"
      />

      <AuthField
        icon={UserCircle2}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Usuário"
        autoComplete="off"
        name="novo_usuario"
      />

      <AuthField
        icon={Lock}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        autoComplete="new-password"
        name="nova_senha"
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: COLORS.inkMuted, marginBottom: 4, fontWeight: 600 }}>FUNÇÃO</div>
        <Select value={role} onChange={setRole} options={["Funcionário", "TI"]} />
      </div>

      {formError && (
        <div style={{ background: COLORS.danger + "15", color: COLORS.danger, fontSize: 12.5, padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>
          {formError}
        </div>
      )}

      <button
        onClick={submit}
        disabled={!name.trim() || !username.trim() || !password || submitting}
        style={{
          width: "100%", padding: "11px 0", borderRadius: 8, border: "none",
          background: name.trim() && username.trim() && password && !submitting ? COLORS.teal : COLORS.gray,
          color: "#fff", fontWeight: 700, fontSize: 13.5,
          cursor: name.trim() && username.trim() && password && !submitting ? "pointer" : "default",
        }}
      >
        {submitting ? "Criando..." : "Criar usuário"}
      </button>
    </div>
  );
}

function NewTicketForm({ onCreate }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Hardware");
  const [priority, setPriority] = useState("Média");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim() || !description.trim() || submitting) return;
    setSubmitting(true);
    await onCreate({ title: title.trim(), description: description.trim(), category, priority });
    setSubmitting(false);
    setTitle(""); setDescription(""); setCategory("Hardware"); setPriority("Média");
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: "100%", padding: "13px 0", borderRadius: 10, border: `1.5px dashed ${COLORS.border}`,
          background: "transparent", color: COLORS.teal, fontWeight: 700, fontSize: 13.5,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        }}
      >
        <Plus size={16} /> Abrir novo chamado
      </button>
    );
  }

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink }}>Novo chamado</div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkMuted }}>
          <X size={17} />
        </button>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título — ex: Impressora do 3º andar não imprime"
        style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, marginBottom: 10, color: COLORS.ink }}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descreva o problema com detalhes..."
        rows={3}
        style={{ width: "100%", fontSize: 13.5, padding: "10px 12px", borderRadius: 8, border: `1px solid ${COLORS.border}`, marginBottom: 10, color: COLORS.ink, resize: "vertical", fontFamily: "inherit" }}
      />
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: COLORS.inkMuted, marginBottom: 4, fontWeight: 600 }}>CATEGORIA</div>
          <Select value={category} onChange={setCategory} options={CATEGORIES.map((c) => c.id)} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: COLORS.inkMuted, marginBottom: 4, fontWeight: 600 }}>PRIORIDADE</div>
          <Select value={priority} onChange={setPriority} options={PRIORITIES} />
        </div>
      </div>
      <button
        onClick={submit}
        disabled={!title.trim() || !description.trim() || submitting}
        style={{
          width: "100%", padding: "11px 0", borderRadius: 8, border: "none",
          background: title.trim() && description.trim() ? COLORS.teal : COLORS.gray,
          color: "#fff", fontWeight: 700, fontSize: 13.5,
          cursor: title.trim() && description.trim() && !submitting ? "pointer" : "default",
        }}
      >
        {submitting ? "Enviando..." : "Enviar chamado"}
      </button>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [ticketView, setTicketView] = useState("ativos");
  const [historyAssigneeFilter, setHistoryAssigneeFilter] = useState("Todos");
  const [error, setError] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [roleEdits, setRoleEdits] = useState({});
  const [savingRoleId, setSavingRoleId] = useState(null);
  const [tiUsers, setTiUsers] = useState([]);
  const intervalRef = useRef(null);

  const refreshTickets = useCallback(async (showSpinner) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await loadTickets();
      setTickets(data);
      setError(null);
    } catch (e) {
      setError("Não foi possível carregar os chamados. Verifique sua conexão.");
    }
    if (showSpinner) setLoading(false);
  }, []);

  const loadProfileForSession = useCallback(async (sess) => {
    if (!sess) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const p = await getProfile(sess.user.id);
      setProfile(p);

      if (p.role === "TI") {
        try {
          const allUsers = await loadUsers();
          setTiUsers(allUsers.filter((user) => user.role === "TI"));
        } catch (usersError) {
          console.error("Não foi possível carregar a lista da TI:", usersError);
          setTiUsers([]);
        }
      } else {
        setTiUsers([]);
      }

      refreshTickets(true);
      intervalRef.current = setInterval(() => refreshTickets(false), REFRESH_INTERVAL_MS);
    } catch (e) {
      setError("Não foi possível carregar seu perfil. Fale com um administrador.");
      setLoading(false);
    }
  }, [refreshTickets]);

  useEffect(() => {
    getSession().then((sess) => {
      setSession(sess);
      loadProfileForSession(sess);
    });
    const subscription = onAuthStateChange((sess) => {
      setSession(sess);
      if (!sess) {
        setProfile(null);
        setTickets([]);
        setTiUsers([]);
        clearInterval(intervalRef.current);
      } else {
        loadProfileForSession(sess);
      }
    });
    return () => {
      clearInterval(intervalRef.current);
      subscription.unsubscribe();
    };
  }, [loadProfileForSession]);

  const handleSignOut = async () => {
    clearInterval(intervalRef.current);
    await signOut();
  };

  const handleCreateUser = async ({ name, username, password, role }) => {
    try {
      await createUserByAdmin({ name, username, password, role });

      const allUsers = await loadUsers();
      setUsers(allUsers);
      setTiUsers(allUsers.filter((user) => user.role === "TI"));

      setError(null);
      setShowUserForm(false);
      alert("Usuário criado com sucesso!");
    } catch (e) {
      console.error(e);
      const message = e.message || "Não foi possível criar o usuário.";
      setError(message);
      throw new Error(message);
    }
  };

  const handleLoadUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await loadUsers();
      setUsers(data);
      setTiUsers(data.filter((user) => user.role === "TI"));
      setRoleEdits(
        Object.fromEntries(
          data.map((user) => [user.id, user.role])
        )
      );
      setShowUsers(true);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Não foi possível carregar os usuários.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSaveUserRole = async (user) => {
    const newRole = roleEdits[user.id];

    if (!newRole || newRole === user.role) return;

    if (user.id === session.user.id) {
      setError("Por segurança, você não pode alterar sua própria função por esta tela.");
      return;
    }

    try {
      setSavingRoleId(user.id);
      const updated = await updateUserRole(user.id, newRole);

      setUsers((prev) => {
        const nextUsers = prev.map((item) =>
          item.id === user.id ? { ...item, role: updated.role } : item
        );

        setTiUsers(nextUsers.filter((item) => item.role === "TI"));

        return nextUsers;
      });

      setError(null);
    } catch (e) {
      console.error(e);
      setError(e.message || "Não foi possível alterar a função do usuário.");

      setRoleEdits((prev) => ({
        ...prev,
        [user.id]: user.role,
      }));
    } finally {
      setSavingRoleId(null);
    }
  };

const handleCreate = async (fields) => {
  try {
    const newTicket = await createTicket({
      ...fields,
      requester: profile.name,
      requester_id: session.user.id,
    });

    setTickets((prev) => [newTicket, ...prev]);
  } catch (e) {
    console.error(e);
    setError("Não foi possível salvar o chamado. Tente novamente.");
  }
};

  const handleUpdate = async (id, changes) => {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
    setSelected((s) => (s && s.id === id ? { ...s, ...changes } : s));
    try {
      await updateTicket(id, changes);
    } catch (e) {
      setError("Não foi possível salvar a alteração.");
    }
  };

  const handleComment = async (ticket, text) => {
  try {
    const newComment = await addComment(
      ticket.id,
      session.user.id,
      profile.name,
      text
    );

    const comments = [...ticket.comments, newComment];

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticket.id ? { ...t, comments } : t
      )
    );

    setSelected((s) =>
      s && s.id === ticket.id
        ? { ...s, comments }
        : s
    );
  } catch (e) {
    console.error(e);
    setError("Não foi possível salvar o comentário.");
  }
};

  if (!session || !profile) {
    return (
      <div style={{ background: COLORS.bg, minHeight: "100vh" }}>
        <AuthScreen onAuthed={() => {}} />
      </div>
    );
  }

  const isIT = profile.role === "TI";
  const myTickets = tickets.filter((t) => t.requester === profile.name);
  const isHistoryTicket = (t) => t.status === "Resolvido" || t.status === "Fechado";
  const activeTickets = tickets.filter((t) => !isHistoryTicket(t));
  const historyTickets = tickets.filter(isHistoryTicket);
  const myActiveTickets = myTickets.filter((t) => !isHistoryTicket(t));
  const myHistoryTickets = myTickets.filter(isHistoryTicket);

  const filtered = activeTickets.filter((t) =>
    (statusFilter === "Todos" || t.status === statusFilter) &&
    (priorityFilter === "Todas" || t.priority === priorityFilter)
  );

  const filteredHistory = historyTickets.filter((t) =>
    historyAssigneeFilter === "Todos" || t.assignee === historyAssigneeFilter
  );

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: tickets.filter((t) => t.status === s).length }), {});

  return (
    <div style={{
      "--stub-bg": COLORS.bg,
      background: COLORS.bg, minHeight: "100vh", padding: 24,
    }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: COLORS.teal }}>CENTRAL DE CHAMADOS</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.ink, marginTop: 1 }}>
              {isIT ? "Painel da TI" : "Meus chamados"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => refreshTickets(true)} title="Atualizar" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: COLORS.inkMuted }}>
              <RefreshCw size={14} />
            </button>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 7, background: COLORS.surface,
                border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: "5px 6px 5px 5px",
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: "50%", background: isIT ? COLORS.indigo : COLORS.teal,
                color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {profile.name.slice(0, 1).toUpperCase()}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.ink }}>{profile.name}</span>
              <span style={{ fontSize: 10.5, color: COLORS.inkMuted, marginRight: 2 }}>· {profile.role}</span>
              <button
                onClick={handleSignOut}
                title="Sair"
                style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.inkMuted, display: "flex", padding: 4 }}
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: COLORS.danger + "15", border: `1px solid ${COLORS.danger}40`, color: COLORS.danger, fontSize: 12.5, padding: "8px 12px", borderRadius: 8, marginBottom: 14 }}>
            {error}
          </div>
        )}

        {!isIT && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <NewTicketForm onCreate={handleCreate} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setTicketView("ativos")} style={{ padding: "9px 13px", borderRadius: 8, cursor: "pointer", border: `1px solid ${ticketView === "ativos" ? COLORS.teal : COLORS.border}`, background: ticketView === "ativos" ? COLORS.teal + "12" : COLORS.surface, color: ticketView === "ativos" ? COLORS.tealDark : COLORS.inkMuted, fontWeight: 700, fontSize: 12.5 }}>Chamados ativos ({myActiveTickets.length})</button>
              <button onClick={() => setTicketView("historico")} style={{ padding: "9px 13px", borderRadius: 8, cursor: "pointer", border: `1px solid ${ticketView === "historico" ? COLORS.teal : COLORS.border}`, background: ticketView === "historico" ? COLORS.teal + "12" : COLORS.surface, color: ticketView === "historico" ? COLORS.tealDark : COLORS.inkMuted, fontWeight: 700, fontSize: 12.5 }}>Histórico ({myHistoryTickets.length})</button>
            </div>
            {(ticketView === "ativos" ? myActiveTickets : myHistoryTickets).length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.inkMuted, fontSize: 13.5 }}>{ticketView === "ativos" ? "Você não possui chamados ativos." : "Você ainda não possui chamados no histórico."}</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {(ticketView === "ativos" ? myActiveTickets : myHistoryTickets).map((t) => (<TicketStub key={t.id} ticket={t} onClick={() => setSelected(t)} />))}
              </div>
            )}
          </div>
        )}

        {isIT && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <button onClick={() => setTicketView("ativos")} style={{ padding: "9px 13px", borderRadius: 8, cursor: "pointer", border: `1px solid ${ticketView === "ativos" ? COLORS.teal : COLORS.border}`, background: ticketView === "ativos" ? COLORS.teal + "12" : COLORS.surface, color: ticketView === "ativos" ? COLORS.tealDark : COLORS.inkMuted, fontWeight: 700, fontSize: 12.5 }}>Chamados ativos ({activeTickets.length})</button>
              <button onClick={() => setTicketView("historico")} style={{ padding: "9px 13px", borderRadius: 8, cursor: "pointer", border: `1px solid ${ticketView === "historico" ? COLORS.teal : COLORS.border}`, background: ticketView === "historico" ? COLORS.teal + "12" : COLORS.surface, color: ticketView === "historico" ? COLORS.tealDark : COLORS.inkMuted, fontWeight: 700, fontSize: 12.5 }}>Histórico ({historyTickets.length})</button>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <button
                onClick={() => setShowUserForm((v) => !v)}
                style={{
                  padding: "10px 14px", borderRadius: 8, border: "none",
                  background: COLORS.teal, color: "#fff", fontWeight: 700,
                  fontSize: 13, cursor: "pointer", display: "inline-flex",
                  alignItems: "center", gap: 6,
                }}
              >
                <Plus size={15} /> Cadastrar usuário
              </button>

              <button
                onClick={() => {
                  if (showUsers) {
                    setShowUsers(false);
                  } else {
                    handleLoadUsers();
                  }
                }}
                disabled={loadingUsers}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.surface,
                  color: COLORS.ink,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: loadingUsers ? "default" : "pointer",
                }}
              >
                {loadingUsers
                  ? "Carregando..."
                  : showUsers
                  ? "Fechar usuários"
                  : "Gerenciar usuários"}
              </button>
            </div>

            {showUserForm && (
              <NewUserForm
                onCreate={handleCreateUser}
                onClose={() => setShowUserForm(false)}
              />
            )}

            {showUsers && (
              <div
                style={{
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.ink,
                    marginBottom: 14,
                  }}
                >
                  Usuários cadastrados
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {users.length === 0 ? (
                    <div style={{ fontSize: 13, color: COLORS.inkMuted, padding: "8px 0" }}>
                      Nenhum usuário encontrado.
                    </div>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 8,
                          background: COLORS.surfaceAlt,
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: COLORS.ink,
                            }}
                          >
                            {user.name}
                          </div>

                          <div
                            style={{
                              fontSize: 11.5,
                              color: COLORS.inkMuted,
                              marginTop: 2,
                            }}
                          >
                            Criado em {fmtDate(user.created_at)}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {user.id === session.user.id ? (
                            <>
                              <Badge color={COLORS.indigo}>{user.role}</Badge>
                              <span style={{ fontSize: 11, color: COLORS.inkMuted }}>Sua conta</span>
                            </>
                          ) : (
                            <>
                              <Select
                                value={roleEdits[user.id] || user.role}
                                onChange={(value) =>
                                  setRoleEdits((prev) => ({
                                    ...prev,
                                    [user.id]: value,
                                  }))
                                }
                                options={["Funcionário", "TI"]}
                                style={{ width: 140 }}
                              />

                              <button
                                onClick={() => handleSaveUserRole(user)}
                                disabled={
                                  savingRoleId === user.id ||
                                  (roleEdits[user.id] || user.role) === user.role
                                }
                                style={{
                                  padding: "8px 11px",
                                  borderRadius: 8,
                                  border: "none",
                                  background:
                                    (roleEdits[user.id] || user.role) !== user.role &&
                                    savingRoleId !== user.id
                                      ? COLORS.teal
                                      : COLORS.gray,
                                  color: "#fff",
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor:
                                    (roleEdits[user.id] || user.role) !== user.role &&
                                    savingRoleId !== user.id
                                      ? "pointer"
                                      : "default",
                                }}
                              >
                                {savingRoleId === user.id ? "Salvando..." : "Salvar"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {ticketView === "ativos" ? (
              <>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${STATUSES.length}, 1fr)`, gap: 10, marginBottom: 16 }}>
              {STATUSES.map((s) => (
                <div key={s} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: STATUS_COLOR[s], marginBottom: 3 }}>{s.toUpperCase()}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.ink }}>{counts[s]}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <Filter size={14} color={COLORS.inkMuted} />
              <Select value={statusFilter} onChange={setStatusFilter} options={["Todos", ...STATUSES]} style={{ width: 150 }} />
              <Select value={priorityFilter} onChange={setPriorityFilter} options={["Todas", ...PRIORITIES]} style={{ width: 130 }} />
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.inkMuted, fontSize: 13.5 }}>
                Nenhum chamado encontrado com esses filtros.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
                {filtered.map((t) => (
                  <TicketStub key={t.id} ticket={t} onClick={() => setSelected(t)} dense />
                ))}
              </div>
            )}

              </>
            ) : (
              <>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                  <Filter size={14} color={COLORS.inkMuted} />
                  <Select value={historyAssigneeFilter} onChange={setHistoryAssigneeFilter} options={["Todos", ...tiUsers.map((user) => user.name)]} style={{ width: 190 }} />
                </div>
                {filteredHistory.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.inkMuted, fontSize: 13.5 }}>Nenhum chamado encontrado no histórico.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filteredHistory.map((t) => (
                      <div key={t.id} onClick={() => setSelected(t)} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ minWidth: 220, flex: 1 }}>
                          <div style={{ fontSize: 11, color: COLORS.inkMuted, fontFamily: "ui-monospace, monospace" }}>{ticketNumber(t.number)}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.ink, marginTop: 2 }}>{t.title}</div>
                          <div style={{ fontSize: 12, color: COLORS.inkMuted, marginTop: 5 }}>Solicitante: <strong style={{ color: COLORS.ink }}>{t.requester}</strong>{" · "}Responsável: <strong style={{ color: COLORS.ink }}>{t.assignee || "Não atribuído"}</strong></div>
                        </div>
                        <div style={{ fontSize: 11.5, color: COLORS.inkMuted, lineHeight: 1.6, textAlign: "right" }}>
                          <div>Aberto: {fmtDate(t.created_at)}</div>
                          <div>{t.resolved_at ? `Resolvido: ${fmtDate(t.resolved_at)}` : `Atualizado: ${fmtDate(t.updated_at)}`}</div>
                        </div>
                        <Badge color={STATUS_COLOR[t.status]} filled>{t.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {selected && (
        <TicketDetail
          ticket={selected}
          isIT={isIT}
          tiUsers={tiUsers}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onComment={handleComment}
        />
      )}
    </div>
  );
}