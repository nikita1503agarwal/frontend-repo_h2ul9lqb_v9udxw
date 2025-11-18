import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

export default function Dashboard() {
  const [customer, setCustomer] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [activities, setActivities] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  // Simple local storage auth stub
  useEffect(() => {
    const saved = localStorage.getItem("customer");
    if (saved) {
      setCustomer(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/restaurants`).then(r=>r.json()).then(setRestaurants).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!customer?.id) return;
    fetch(`${API_BASE}/api/customers/${customer.id}/activities`).then(r=>r.json()).then(setActivities).catch(()=>{});
    fetch(`${API_BASE}/api/customers/${customer.id}/reservations?status=upcoming`).then(r=>r.json()).then(setUpcoming).catch(()=>{});
    fetch(`${API_BASE}/api/customers/${customer.id}/reservations?status=past`).then(r=>r.json()).then(setHistory).catch(()=>{});
  }, [customer]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/customers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      const data = await res.json();
      setCustomer(data);
      localStorage.setItem("customer", JSON.stringify(data));
    } else {
      alert("Login failed. Try registering.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/api/customers/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (res.ok) {
      setCustomer(data);
      localStorage.setItem("customer", JSON.stringify(data));
    } else {
      alert(data?.detail || "Registration failed");
    }
  };

  return (
    <div className="space-y-8">
      {/* Auth / Profile */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        {customer ? (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl font-semibold">Welcome, {customer.name || customer.email}</h2>
              <p className="text-sm text-blue-200/70">Loyalty points: <span className="font-semibold">{customer.loyalty_points ?? 0}</span></p>
            </div>
            <button onClick={() => {localStorage.removeItem("customer"); setCustomer(null);}} className="px-4 py-2 rounded bg-red-500/80 hover:bg-red-500 text-white text-sm">Logout</button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <form onSubmit={handleLogin} className="space-y-2">
              <h3 className="text-white font-semibold">Login</h3>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded bg-slate-900/60 border border-white/10 text-white text-sm" />
              <button className="px-3 py-2 rounded bg-blue-500/80 hover:bg-blue-500 text-white text-sm">Login</button>
            </form>
            <form onSubmit={handleRegister} className="space-y-2">
              <h3 className="text-white font-semibold">Register</h3>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full px-3 py-2 rounded bg-slate-900/60 border border-white/10 text-white text-sm" />
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded bg-slate-900/60 border border-white/10 text-white text-sm" />
              <button className="px-3 py-2 rounded bg-emerald-500/80 hover:bg-emerald-500 text-white text-sm">Create account</button>
            </form>
          </div>
        )}
      </div>

      {/* Restaurants list */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Restaurants</h3>
          <button onClick={async ()=>{await fetch(`${API_BASE}/api/seed`,{method:'POST'}); const r=await fetch(`${API_BASE}/api/restaurants`); setRestaurants(await r.json());}} className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs">Load demo data</button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map(r => (
            <div key={r.id} className="rounded-lg overflow-hidden bg-slate-900/60 border border-white/10">
              {r.thumbnail_url && <img src={r.thumbnail_url} alt={r.name} className="h-32 w-full object-cover" />}
              <div className="p-4 space-y-1">
                <div className="text-white font-medium">{r.name}</div>
                <div className="text-blue-200/70 text-sm line-clamp-2">{r.description}</div>
                <a href={`#/restaurant/${r.id}`} className="inline-block mt-2 text-xs text-blue-300 hover:text-blue-200">View details →</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity and reservations */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 lg:col-span-1">
          <h3 className="text-white font-semibold mb-3">Latest activity</h3>
          <div className="space-y-2 max-h-64 overflow-auto pr-2">
            {activities.length === 0 && <div className="text-blue-200/60 text-sm">No recent activity.</div>}
            {activities.map(a => (
              <div key={a.id} className="text-sm text-blue-100/90">• {a.message}</div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 lg:col-span-2">
          <h3 className="text-white font-semibold mb-3">Upcoming reservations</h3>
          <div className="space-y-2">
            {upcoming.length === 0 && <div className="text-blue-200/60 text-sm">No upcoming reservations.</div>}
            {upcoming.map((r, i) => (
              <div key={i} className="text-sm text-blue-100/90">{new Date(r.reservation_time).toLocaleString()} • Table {r.table_id} • Party {r.party_size} • {r.status}</div>
            ))}
          </div>
          <h3 className="text-white font-semibold mt-6 mb-3">History</h3>
          <div className="space-y-2">
            {history.length === 0 && <div className="text-blue-200/60 text-sm">No history yet.</div>}
            {history.map((r, i) => (
              <div key={i} className="text-sm text-blue-100/90">{new Date(r.reservation_time).toLocaleString()} • Table {r.table_id} • Party {r.party_size}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
