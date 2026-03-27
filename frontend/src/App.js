import { useState, useEffect, useCallback } from "react";
import * as api from "./api";

/* ═══════════════════════════════════════════════════════════
   STYLES — Industrial-Warm aesthetic with sharp geometry
   ═══════════════════════════════════════════════════════════ */
const THEME = {
  bg: "#0F1117",
  surface: "#171A24",
  surfaceHover: "#1E2233",
  card: "#1B1F2D",
  border: "#2A2F42",
  accent: "#E8A838",
  accentSoft: "rgba(232,168,56,0.12)",
  accentGlow: "rgba(232,168,56,0.25)",
  danger: "#E85454",
  success: "#34C77B",
  pending: "#5B8DEF",
  text: "#EAEDF6",
  textMuted: "#7A809A",
  textDim: "#4E536A",
};

const baseStyle = {
  fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
  color: THEME.text,
  background: THEME.bg,
  minHeight: "100vh",
};

const cardStyle = {
  background: THEME.card,
  border: `1px solid ${THEME.border}`,
  borderRadius: "6px",
  padding: "24px",
};

const btnPrimary = {
  background: THEME.accent,
  color: "#0F1117",
  border: "none",
  borderRadius: "4px",
  padding: "12px 28px",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  transition: "all 0.15s",
};

const btnOutline = {
  ...btnPrimary,
  background: "transparent",
  color: THEME.accent,
  border: `1px solid ${THEME.accent}`,
};

const btnDanger = {
  ...btnPrimary,
  background: THEME.danger,
  color: "#fff",
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  background: THEME.bg,
  border: `1px solid ${THEME.border}`,
  borderRadius: "4px",
  color: THEME.text,
  fontFamily: "inherit",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "11px",
  fontWeight: 600,
  color: THEME.textMuted,
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const statusBadge = (color) => ({
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: "3px",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  background: `${color}18`,
  color: color,
  border: `1px solid ${color}30`,
});

/* ═══════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function Nav({ page, setPage, user, onLogout }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "◆" },
    { key: "attendance", label: "Attendance", icon: "◷" },
    { key: "leave", label: "Leave", icon: "✦" },
  ];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: "240px",
      background: THEME.surface, borderRight: `1px solid ${THEME.border}`,
      display: "flex", flexDirection: "column", zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: "28px 24px", borderBottom: `1px solid ${THEME.border}`,
      }}>
        <div style={{ fontSize: "18px", fontWeight: 800, color: THEME.accent, letterSpacing: "-0.5px" }}>
          ◉ ATTENDR
        </div>
        <div style={{ fontSize: "10px", color: THEME.textDim, marginTop: "4px", letterSpacing: "2px" }}>
          OFFICE TRACKER
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1, padding: "16px 12px" }}>
        {navItems.map((item) => (
          <div
            key={item.key}
            onClick={() => setPage(item.key)}
            style={{
              padding: "12px 16px",
              marginBottom: "4px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: page === item.key ? 700 : 400,
              color: page === item.key ? THEME.accent : THEME.textMuted,
              background: page === item.key ? THEME.accentSoft : "transparent",
              borderLeft: page === item.key ? `3px solid ${THEME.accent}` : "3px solid transparent",
              transition: "all 0.15s",
              letterSpacing: "0.3px",
            }}
          >
            <span style={{ marginRight: "12px" }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      {/* User Info */}
      <div style={{
        padding: "20px 24px",
        borderTop: `1px solid ${THEME.border}`,
      }}>
        <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "2px" }}>
          {user?.first_name} {user?.last_name}
        </div>
        <div style={{ fontSize: "10px", color: THEME.textDim, marginBottom: "12px" }}>
          {user?.department?.toUpperCase()} · {user?.employee_id}
        </div>
        <div
          onClick={onLogout}
          style={{
            fontSize: "11px", color: THEME.danger, cursor: "pointer",
            fontWeight: 600, letterSpacing: "0.5px",
          }}
        >
          ← SIGN OUT
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      ...cardStyle,
      borderTop: `3px solid ${color || THEME.accent}`,
      flex: 1,
      minWidth: "180px",
    }}>
      <div style={{ fontSize: "10px", color: THEME.textDim, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "12px" }}>
        {label}
      </div>
      <div style={{ fontSize: "32px", fontWeight: 800, color: color || THEME.accent, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "11px", color: THEME.textMuted, marginTop: "8px" }}>{sub}</div>}
    </div>
  );
}

function Alert({ message, type, onClose }) {
  if (!message) return null;
  const colors = { success: THEME.success, error: THEME.danger, info: THEME.pending };
  const c = colors[type] || THEME.accent;
  return (
    <div style={{
      padding: "12px 20px",
      borderRadius: "4px",
      background: `${c}15`,
      border: `1px solid ${c}40`,
      color: c,
      fontSize: "13px",
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      {message}
      <span onClick={onClose} style={{ cursor: "pointer", fontWeight: 700, marginLeft: "16px" }}>✕</span>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ textAlign: "center", padding: "60px", color: THEME.textDim }}>
      <div style={{
        width: "28px", height: "28px", border: `3px solid ${THEME.border}`,
        borderTop: `3px solid ${THEME.accent}`, borderRadius: "50%",
        animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Loading...
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOGIN / REGISTER PAGE
   ═══════════════════════════════════════════════════════════ */

function AuthPage({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: "", password: "", email: "",
    first_name: "", last_name: "",
    employee_id: "", department: "engineering",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const data = await api.login(form.username, form.password);
        onAuth(data.user);
      } else {
        const data = await api.register(form);
        onAuth(data.user);
      }
    } catch (err) {
      const errData = err.data || {};
      const msg = typeof errData === "object"
        ? Object.values(errData).flat().join(", ")
        : err.message;
      setError(msg || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div style={{
      ...baseStyle,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Background pattern */}
      <div style={{
        position: "fixed", inset: 0, opacity: 0.03,
        backgroundImage: `repeating-linear-gradient(0deg, ${THEME.accent} 0 1px, transparent 1px 60px),
          repeating-linear-gradient(90deg, ${THEME.accent} 0 1px, transparent 1px 60px)`,
      }} />

      <div style={{ position: "relative", width: "400px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            fontSize: "36px", fontWeight: 900, color: THEME.accent,
            letterSpacing: "-1px", marginBottom: "8px",
          }}>
            ◉ ATTENDR
          </div>
          <div style={{
            fontSize: "11px", color: THEME.textDim, letterSpacing: "4px", textTransform: "uppercase",
          }}>
            Office Attendance Tracker
          </div>
        </div>

        {/* Form Card */}
        <div style={{
          ...cardStyle,
          border: `1px solid ${THEME.border}`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
        }}>
          {/* Toggle */}
          <div style={{
            display: "flex", marginBottom: "28px", borderRadius: "4px",
            overflow: "hidden", border: `1px solid ${THEME.border}`,
          }}>
            {["Sign In", "Register"].map((t, i) => (
              <div
                key={t}
                onClick={() => { setIsLogin(i === 0); setError(""); }}
                style={{
                  flex: 1, textAlign: "center", padding: "10px",
                  fontSize: "12px", fontWeight: 700, cursor: "pointer",
                  letterSpacing: "0.8px", textTransform: "uppercase",
                  background: (i === 0 ? isLogin : !isLogin) ? THEME.accent : "transparent",
                  color: (i === 0 ? isLogin : !isLogin) ? "#0F1117" : THEME.textMuted,
                  transition: "all 0.15s",
                }}
              >
                {t}
              </div>
            ))}
          </div>

          {error && <Alert message={error} type="error" onClose={() => setError("")} />}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Username</label>
              <input style={inputStyle} value={form.username} onChange={set("username")} placeholder="johndoe" />
            </div>

            {!isLogin && (
              <>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>First Name</label>
                    <input style={inputStyle} value={form.first_name} onChange={set("first_name")} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Last Name</label>
                    <input style={inputStyle} value={form.last_name} onChange={set("last_name")} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={set("email")} />
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Employee ID</label>
                    <input style={inputStyle} value={form.employee_id} onChange={set("employee_id")} placeholder="EMP001" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Department</label>
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={form.department} onChange={set("department")}>
                      <option value="engineering">Engineering</option>
                      <option value="design">Design</option>
                      <option value="marketing">Marketing</option>
                      <option value="hr">Human Resources</option>
                      <option value="finance">Finance</option>
                      <option value="operations">Operations</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>Password</label>
              <input
                style={inputStyle}
                type="password"
                value={form.password}
                onChange={set("password")}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...btnPrimary,
                width: "100%",
                marginTop: "8px",
                opacity: loading ? 0.6 : 1,
                fontSize: "13px",
                padding: "14px",
              }}
            >
              {loading ? "PROCESSING..." : isLogin ? "SIGN IN →" : "CREATE ACCOUNT →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════════════════ */

function DashboardPage() {
  const [data, setData] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const d = await api.getDashboard();
      setData(d);
    } catch { setAlert({ message: "Failed to load dashboard", type: "error" }); }
    setLoading(false);
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleClockIn = async () => {
    try {
      await api.clockIn();
      setAlert({ message: "Clocked in! Have a great day.", type: "success" });
      loadDashboard();
    } catch (err) { setAlert({ message: err.message, type: "error" }); }
  };

  const handleClockOut = async () => {
    try {
      await api.clockOut();
      setAlert({ message: "Clocked out! See you tomorrow.", type: "success" });
      loadDashboard();
    } catch (err) { setAlert({ message: err.message, type: "error" }); }
  };

  if (loading) return <Loader />;
  if (!data) return null;

  const { month_summary: ms, today: t } = data;
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "" })} />

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ fontSize: "10px", color: THEME.textDim, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>
          {data.current_month}
        </div>
        <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Dashboard
        </div>
      </div>

      {/* Clock In/Out */}
      <div style={{
        ...cardStyle,
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: `linear-gradient(135deg, ${THEME.card} 0%, ${THEME.surface} 100%)`,
        borderLeft: `4px solid ${THEME.accent}`,
      }}>
        <div>
          <div style={{ fontSize: "11px", color: THEME.textDim, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px" }}>
            Current Time
          </div>
          <div style={{ fontSize: "42px", fontWeight: 900, color: THEME.accent, letterSpacing: "-2px" }}>
            {timeStr}
          </div>
          <div style={{ fontSize: "12px", color: THEME.textMuted, marginTop: "8px" }}>
            {t.clocked_in && !t.clocked_out && (
              <span>Clocked in at {new Date(t.clock_in_time).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            )}
            {t.clocked_out && (
              <span>Day complete · {t.hours_worked}h logged</span>
            )}
            {!t.clocked_in && <span>Not clocked in yet</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {!t.clocked_in && (
            <button onClick={handleClockIn} style={btnPrimary}>
              ● CLOCK IN
            </button>
          )}
          {t.clocked_in && !t.clocked_out && (
            <button onClick={handleClockOut} style={btnDanger}>
              ■ CLOCK OUT
            </button>
          )}
          {t.clocked_out && (
            <span style={statusBadge(THEME.success)}>✓ Day Complete</span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <StatCard label="Present Days" value={ms.present_days} sub="this month" color={THEME.success} />
        <StatCard label="Total Hours" value={ms.total_hours} sub={`avg ${ms.avg_hours_per_day}h/day`} color={THEME.accent} />
        <StatCard label="Leave Days" value={ms.leave_days} sub="approved" color={THEME.pending} />
        <StatCard label="Pending" value={data.pending_leaves} sub="leave requests" color={THEME.danger} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ATTENDANCE HISTORY PAGE
   ═══════════════════════════════════════════════════════════ */

function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setLoading(true);
    api.getAttendanceHistory(month, year)
      .then(data => {
        // handle both paginated and flat responses
        setRecords(Array.isArray(data) ? data : data.results || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [month, year]);

  const statusColor = {
    present: THEME.success,
    absent: THEME.danger,
    half_day: THEME.accent,
    on_leave: THEME.pending,
  };

  return (
    <div>
      <div style={{ fontSize: "28px", fontWeight: 800, marginBottom: "24px", letterSpacing: "-0.5px" }}>
        Attendance Log
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <select
          style={{ ...inputStyle, width: "160px", cursor: "pointer" }}
          value={month}
          onChange={(e) => setMonth(+e.target.value)}
        >
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          style={{ ...inputStyle, width: "120px", cursor: "pointer" }}
          value={year}
          onChange={(e) => setYear(+e.target.value)}
        >
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? <Loader /> : (
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          {/* Table Header */}
          <div style={{
            display: "grid", gridTemplateColumns: "120px 100px 100px 80px 1fr",
            padding: "14px 20px", background: THEME.surface,
            borderBottom: `1px solid ${THEME.border}`,
            fontSize: "10px", fontWeight: 700, color: THEME.textDim,
            letterSpacing: "1.5px", textTransform: "uppercase",
          }}>
            <div>Date</div><div>Clock In</div><div>Clock Out</div><div>Hours</div><div>Status</div>
          </div>

          {records.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: THEME.textDim, fontSize: "13px" }}>
              No records found for this period.
            </div>
          ) : records.map((r) => (
            <div
              key={r.id}
              style={{
                display: "grid", gridTemplateColumns: "120px 100px 100px 80px 1fr",
                padding: "14px 20px", borderBottom: `1px solid ${THEME.border}`,
                fontSize: "13px", transition: "background 0.1s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = THEME.surfaceHover}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <div style={{ fontWeight: 600 }}>{r.date}</div>
              <div style={{ color: THEME.textMuted }}>
                {r.clock_in ? new Date(r.clock_in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
              </div>
              <div style={{ color: THEME.textMuted }}>
                {r.clock_out ? new Date(r.clock_out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
              </div>
              <div style={{ fontWeight: 700, color: THEME.accent }}>
                {r.hours_worked || "—"}
              </div>
              <div>
                <span style={statusBadge(statusColor[r.status] || THEME.textDim)}>
                  {r.status?.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LEAVE REQUEST PAGE
   ═══════════════════════════════════════════════════════════ */

function LeavePage() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [form, setForm] = useState({
    leave_type: "casual", start_date: "", end_date: "", reason: "",
  });

  const loadLeaves = useCallback(async () => {
    try {
      const data = await api.getLeaveRequests();
      setLeaves(Array.isArray(data) ? data : data.results || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadLeaves(); }, [loadLeaves]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    if (!form.start_date || !form.end_date || !form.reason) {
      setAlert({ message: "Please fill all fields", type: "error" });
      return;
    }
    try {
      await api.submitLeaveRequest(form);
      setAlert({ message: "Leave request submitted!", type: "success" });
      setShowForm(false);
      setForm({ leave_type: "casual", start_date: "", end_date: "", reason: "" });
      loadLeaves();
    } catch (err) {
      setAlert({ message: err.message, type: "error" });
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.cancelLeaveRequest(id);
      setAlert({ message: "Leave request cancelled", type: "info" });
      loadLeaves();
    } catch (err) {
      setAlert({ message: err.message, type: "error" });
    }
  };

  const statusColor = {
    pending: THEME.accent,
    approved: THEME.success,
    rejected: THEME.danger,
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Leave Requests
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={showForm ? btnOutline : btnPrimary}
        >
          {showForm ? "✕ CANCEL" : "+ NEW REQUEST"}
        </button>
      </div>

      <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ message: "", type: "" })} />

      {/* Leave Form */}
      {showForm && (
        <div style={{ ...cardStyle, marginBottom: "24px", borderLeft: `4px solid ${THEME.accent}` }}>
          <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "20px" }}>
            Apply for Leave
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Leave Type</label>
                <select style={{ ...inputStyle, cursor: "pointer" }} value={form.leave_type} onChange={set("leave_type")}>
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="earned">Earned Leave</option>
                  <option value="unpaid">Unpaid Leave</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Start Date</label>
                <input style={inputStyle} type="date" value={form.start_date} onChange={set("start_date")} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>End Date</label>
                <input style={inputStyle} type="date" value={form.end_date} onChange={set("end_date")} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Reason</label>
              <textarea
                style={{ ...inputStyle, height: "80px", resize: "vertical" }}
                value={form.reason}
                onChange={set("reason")}
                placeholder="Describe the reason for your leave..."
              />
            </div>
            <button onClick={handleSubmit} style={{ ...btnPrimary, alignSelf: "flex-end" }}>
              SUBMIT REQUEST →
            </button>
          </div>
        </div>
      )}

      {/* Leave List */}
      {loading ? <Loader /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {leaves.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", color: THEME.textDim, fontSize: "13px" }}>
              No leave requests yet.
            </div>
          ) : leaves.map((l) => (
            <div key={l.id} style={{
              ...cardStyle,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderLeft: `4px solid ${statusColor[l.status]}`,
            }}>
              <div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
                  <span style={statusBadge(statusColor[l.status])}>{l.status}</span>
                  <span style={{ fontSize: "12px", color: THEME.textMuted }}>
                    {l.leave_type?.replace("_", " ")} · {l.total_days} day{l.total_days > 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
                  {l.start_date} → {l.end_date}
                </div>
                <div style={{ fontSize: "12px", color: THEME.textMuted }}>{l.reason}</div>
              </div>
              {l.status === "pending" && (
                <button
                  onClick={() => handleCancel(l.id)}
                  style={{ ...btnDanger, padding: "8px 16px", fontSize: "11px" }}
                >
                  CANCEL
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP — Routing + Auth State
   ═══════════════════════════════════════════════════════════ */

export default function App() {
  const [user, setUser] = useState(api.getCurrentUser());
  const [page, setPage] = useState("dashboard");

  const handleAuth = (userData) => setUser(userData);

  const handleLogout = async () => {
    try { await api.logout(); } catch {}
    setUser(null);
  };

  // Not logged in → show auth page
  if (!user) return <AuthPage onAuth={handleAuth} />;

  // Logged in → show main app
  const pages = {
    dashboard: <DashboardPage />,
    attendance: <AttendancePage />,
    leave: <LeavePage />,
  };

  return (
    <div style={baseStyle}>
      <Nav page={page} setPage={setPage} user={user} onLogout={handleLogout} />
      <div style={{ marginLeft: "240px", padding: "32px 40px", maxWidth: "960px" }}>
        {pages[page]}
      </div>
    </div>
  );
}
