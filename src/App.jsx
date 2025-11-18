import { useEffect, useMemo, useState } from 'react'
import { HashRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import RestaurantDetail from './components/RestaurantDetail'
import Header from './components/Header'

function Layout() {
  const [customer, setCustomer] = useState(null);

  useEffect(()=>{
    const saved = localStorage.getItem('customer');
    if (saved) setCustomer(JSON.parse(saved));
  },[]);

  const logout = () => { localStorage.removeItem('customer'); setCustomer(null); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      <div className="relative">
        <Header customer={customer} onLogout={logout} />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/restaurant/:id" element={<RestaurantRoute customer={customer} />} />
            <Route path="/waitlist" element={<Waitlist customer={customer} />} />
            <Route path="/profile" element={<Profile customer={customer} setCustomer={setCustomer} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function RestaurantRoute({ customer }){
  const { id } = useParams();
  return <RestaurantDetail restaurantId={id} customer={customer} />
}

const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

function Waitlist({ customer }){
  const [items, setItems] = useState([]);
  useEffect(()=>{
      if (!customer?.id) return;
      fetch(`${API_BASE}/api/customers/${customer.id}/waitlist`).then(r=>r.json()).then(setItems).catch(()=>{});
  },[customer]);
  if (!customer) return <div className="text-blue-200">Login to view your waitlist.</div>
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <h3 className="text-white font-semibold mb-3">Your Waitlist</h3>
      <div className="space-y-2">
        {items.length===0 && <div className="text-blue-200/70 text-sm">No items on the waitlist.</div>}
        {items.map(i => (
          <div key={i.id} className="text-sm text-blue-100/90">{new Date(i.desired_time).toLocaleString()} • Party {i.party_size} • {i.status}</div>
        ))}
      </div>
    </div>
  );
}

function Profile({ customer, setCustomer }){
  const [form, setForm] = useState({ name: customer?.name || '', phone: customer?.phone || '', avatar_url: customer?.avatar_url || ''});
  const [msg, setMsg] = useState('');
  useEffect(()=>{ setForm({ name: customer?.name || '', phone: customer?.phone || '', avatar_url: customer?.avatar_url || ''}); }, [customer]);

  const save = async ()=>{
    if (!customer?.id) return;
    const res = await fetch(`${API_BASE}/api/customers/${customer.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    const data = await res.json();
    if (res.ok) {
      setCustomer(data); localStorage.setItem('customer', JSON.stringify(data)); setMsg('Profile updated');
    } else setMsg(data?.detail || 'Error updating');
  };

  if (!customer) return <div className="text-blue-200">Login to view your profile.</div>

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6 space-y-3">
        <h3 className="text-white font-semibold">Profile</h3>
        <input value={form.name} onChange={e=>setForm(s=>({...s, name: e.target.value}))} placeholder="Name" className="w-full px-3 py-2 rounded bg-slate-900/60 border border-white/10 text-white text-sm" />
        <input value={form.phone} onChange={e=>setForm(s=>({...s, phone: e.target.value}))} placeholder="Phone" className="w-full px-3 py-2 rounded bg-slate-900/60 border border-white/10 text-white text-sm" />
        <input value={form.avatar_url} onChange={e=>setForm(s=>({...s, avatar_url: e.target.value}))} placeholder="Avatar URL" className="w-full px-3 py-2 rounded bg-slate-900/60 border border-white/10 text-white text-sm" />
        <button onClick={save} className="px-4 py-2 rounded bg-blue-500/80 hover:bg-blue-500 text-white text-sm">Save</button>
        {msg && <div className="text-blue-200/80 text-sm">{msg}</div>}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3">Loyalty</h3>
        <Loyalty customer={customer} />
      </div>
    </div>
  );
}

function Loyalty({ customer }){
  const [points, setPoints] = useState(0);
  useEffect(()=>{
    if (!customer?.id) return;
    fetch(`${API_BASE}/api/customers/${customer.id}/loyalty`).then(r=>r.json()).then(d=>setPoints(d.loyalty_points || 0)).catch(()=>{});
  },[customer]);
  return <div className="text-blue-100">Points: <span className="font-semibold">{points}</span></div>
}

export default function App() {
  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  )
}
