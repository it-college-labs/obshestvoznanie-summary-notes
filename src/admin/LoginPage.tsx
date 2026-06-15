import { useState } from "react";
import { useAuth } from "./useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
    } catch (_err) {
      setError("Неверный пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h1>Вход в админку</h1>
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="admin-login-error">{error}</p>}
        <button type="submit" disabled={loading || !password}>
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
