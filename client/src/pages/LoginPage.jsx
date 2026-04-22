import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then(() => {
        if (!cancelled) navigate("/tasks", { replace: true });
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function startGoogle() {
    setError("");
    window.location.href = "/auth/google";
  }

  if (checking) return <div className="page">Checking session…</div>;

  return (
    <div className="page">
      <div className="card">
        <h1 className="title">Todo Practice</h1>
        <p className="muted">Sign in with Google to continue.</p>
        {error ? <div className="error">{error}</div> : null}
        <button className="btn" onClick={startGoogle}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}

