import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

function cacheKey(userId) {
  return `todos_cache_${userId}`;
}

function formatDueDateInput(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function TasksPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("all");
  const [todos, setTodos] = useState([]);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [usingCache, setUsingCache] = useState(false);

  const [signupOpen, setSignupOpen] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupSaving, setSignupSaving] = useState(false);
  const [signupError, setSignupError] = useState("");

  const visibleTodos = useMemo(() => {
    if (status === "active") return todos.filter((t) => !t.completed);
    if (status === "done") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, status]);

  async function loadMeAndTodos() {
    setLoading(true);
    setError("");
    setUsingCache(false);

    let me;
    try {
      me = await api.me();
      setUser(me);
      if (!me.profileComplete) {
        setSignupName(me.name || "");
        setSignupOpen(true);
      }
    } catch (e) {
      if (e?.status === 401) return navigate("/login", { replace: true });
      setError(e.message || "Failed to load session");
      setLoading(false);
      return;
    }

    try {
      const res = await api.listTodos("all");
      setTodos(res.todos || []);
      localStorage.setItem(cacheKey(me.id), JSON.stringify(res.todos || []));
    } catch (e) {
      if (e?.status === 401) return navigate("/login", { replace: true });
      setError(e.message || "Failed to load tasks");
      try {
        const raw = localStorage.getItem(cacheKey(me.id));
        if (raw) {
          const cached = JSON.parse(raw);
          if (Array.isArray(cached)) {
            setTodos(cached);
            setUsingCache(true);
          }
        }
      } catch {
        // ignore cache errors
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeAndTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: trimmed,
        notes: notes.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      };
      const res = await api.createTodo(payload);
      setTodos((prev) => [res.todo, ...prev]);
      setTitle("");
      setNotes("");
      setDueDate("");
    } catch (e2) {
      if (e2?.status === 401) return navigate("/login", { replace: true });
      setError(e2.message || "Create failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onToggle(id) {
    setError("");
    try {
      const res = await api.toggleTodo(id);
      setTodos((prev) => prev.map((t) => (t._id === id ? res.todo : t)));
    } catch (e) {
      if (e?.status === 401) return navigate("/login", { replace: true });
      setError(e.message || "Toggle failed");
    }
  }

  async function onDelete(id) {
    setError("");
    try {
      await api.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (e) {
      if (e?.status === 401) return navigate("/login", { replace: true });
      setError(e.message || "Delete failed");
    }
  }

  async function onEditTitle(id, nextTitle) {
    const trimmed = nextTitle.trim();
    if (!trimmed) return;
    setError("");

    try {
      const res = await api.updateTodo(id, { title: trimmed });
      setTodos((prev) => prev.map((t) => (t._id === id ? res.todo : t)));
    } catch (e) {
      if (e?.status === 401) return navigate("/login", { replace: true });
      setError(e.message || "Update failed");
    }
  }

  async function onLogout() {
    setError("");
    try {
      await api.logout();
    } finally {
      if (user?.id) localStorage.removeItem(cacheKey(user.id));
      navigate("/login", { replace: true });
    }
  }

  async function saveSignupName() {
    const trimmed = signupName.trim();
    if (!trimmed) {
      setSignupError("Name is required");
      return;
    }
    setSignupSaving(true);
    setSignupError("");
    try {
      const updated = await api.updateMe({ name: trimmed });
      setUser(updated);
      setSignupOpen(false);
    } catch (e) {
      setSignupError(e.message || "Failed to save name");
    } finally {
      setSignupSaving(false);
    }
  }

  if (loading) return <div className="page">Loading…</div>;

  return (
    <div className="page">
      <div className="topbar">
        <div className="topbar-left">
          <Avatar name={user?.name} photoUrl={user?.photoUrl} />
          <div className="topbar-meta">
            <div className="title">Tasks</div>
            <div className="muted small">
              {user?.email ? `Signed in as ${user.email}` : "Signed in"}
              {usingCache ? " (cached)" : ""}
            </div>
          </div>
        </div>
        <button className="btn secondary" onClick={onLogout}>
          Sign out
        </button>
      </div>

      <div className="card">
        <form onSubmit={onCreate} className="row">
          <input
            className="input"
            placeholder="New task title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            disabled={submitting}
          />
          <button className="btn" disabled={submitting || !title.trim()}>
            {submitting ? "Adding…" : "Add"}
          </button>
        </form>
        <div className="row">
          <input
            className="input"
            placeholder="Notes (optional)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={500}
            disabled={submitting}
          />
          <input
            className="input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={submitting}
            style={{ maxWidth: 180 }}
          />
        </div>

        <div className="filters">
          <button className={`chip ${status === "all" ? "active" : ""}`} onClick={() => setStatus("all")} type="button">
            All
          </button>
          <button
            className={`chip ${status === "active" ? "active" : ""}`}
            onClick={() => setStatus("active")}
            type="button"
          >
            Active
          </button>
          <button className={`chip ${status === "done" ? "active" : ""}`} onClick={() => setStatus("done")} type="button">
            Done
          </button>
          <button className="chip" onClick={loadMeAndTodos} type="button">
            Refresh
          </button>
        </div>

        {error ? (
          <div className="error">
            {error} <button className="link" onClick={loadMeAndTodos}>Retry</button>
          </div>
        ) : null}

        {visibleTodos.length === 0 ? (
          <div className="empty">No tasks yet.</div>
        ) : (
          <ul className="list">
            {visibleTodos.map((t) => (
              <TodoRow key={t._id} todo={t} onToggle={onToggle} onDelete={onDelete} onEditTitle={onEditTitle} />
            ))}
          </ul>
        )}
      </div>

      {signupOpen ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h2 className="modal-title">Finish signup</h2>
            <p className="muted">Confirm your display name for this app.</p>
            {signupError ? <div className="error">{signupError}</div> : null}
            <input
              className="input"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              disabled={signupSaving}
            />
            <div className="row right">
              <button className="btn" onClick={saveSignupName} disabled={signupSaving || !signupName.trim()}>
                {signupSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Avatar({ name, photoUrl }) {
  const letter = (name || "?").trim().slice(0, 1).toUpperCase();
  if (photoUrl) {
    return <img className="avatar" src={photoUrl} alt={name ? `${name} avatar` : "User avatar"} referrerPolicy="no-referrer" />;
  }
  return <div className="avatar avatar-fallback">{letter}</div>;
}

function TodoRow({ todo, onToggle, onDelete, onEditTitle }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  useEffect(() => {
    setDraft(todo.title);
  }, [todo.title]);

  async function submitEdit(e) {
    e.preventDefault();
    await onEditTitle(todo._id, draft);
    setEditing(false);
  }

  return (
    <li className="item">
      <label className="check">
        <input type="checkbox" checked={!!todo.completed} onChange={() => onToggle(todo._id)} />
      </label>

      <div className="content">
        {editing ? (
          <form onSubmit={submitEdit} className="row">
            <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={100} />
            <button className="btn small" disabled={!draft.trim()}>
              Save
            </button>
            <button className="btn secondary small" type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <>
            <div className={`task ${todo.completed ? "done" : ""}`}>{todo.title}</div>
            {todo.notes ? <div className="muted small">{todo.notes}</div> : null}
            {todo.dueDate ? <div className="muted small">Due: {formatDueDateInput(todo.dueDate)}</div> : null}
          </>
        )}
      </div>

      {!editing ? (
        <div className="actions">
          <button className="btn secondary small" onClick={() => setEditing(true)} type="button">
            Edit
          </button>
          <button className="btn danger small" onClick={() => onDelete(todo._id)} type="button">
            Delete
          </button>
        </div>
      ) : null}
    </li>
  );
}
