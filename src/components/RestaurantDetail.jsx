import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "";

export default function RestaurantDetail({ restaurantId, customer }) {
  const [restaurant, setRestaurant] = useState(null);
  const [partySize, setPartySize] = useState(2);
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (!restaurantId) return;
    fetch(`${API_BASE}/api/restaurants/${restaurantId}`).then(r=>r.json()).then(setRestaurant).catch(()=>{});
  }, [restaurantId]);

  const reserve = async () => {
    if (!customer?.id) { setStatusMsg("Please login or register first."); return; }
    if (!dateTime) { setStatusMsg("Pick date & time."); return; }
    const res = await fetch(`${API_BASE}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customer.id,
        restaurant_id: restaurantId,
        reservation_time: new Date(dateTime).toISOString(),
        party_size: Number(partySize),
        notes
      })
    });
    const data = await res.json();
    if (res.ok) {
      setStatusMsg(data.status === 'confirmed' ? 'Reservation confirmed!' : 'No table available, added to waitlist.');
    } else {
      setStatusMsg(data?.detail || 'Error creating reservation');
    }
  };

  if (!restaurant) return <div className="text-blue-200">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden bg-white/5 border border-white/10">
        {restaurant.images?.[0] && (
          <img src={restaurant.images[0]} className="w-full h-56 object-cover" />
        )}
        <div className="p-6 space-y-2">
          <h2 className="text-white text-2xl font-semibold">{restaurant.name}</h2>
          <p className="text-blue-200/80">{restaurant.description}</p>
          <div className="text-blue-200/80 text-sm">
            <div>Phone: {restaurant.phone || '—'}</div>
            <div>Email: {restaurant.email || '—'}</div>
            <div>Address: {restaurant.address || '—'}</div>
            {restaurant.location_lat && restaurant.location_lng && (
              <a className="text-blue-300 hover:text-blue-200" target="_blank" href={`https://www.google.com/maps?q=${restaurant.location_lat},${restaurant.location_lng}`}>Open in Maps</a>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Menu</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {restaurant.menu?.map((m, i) => (
            <div key={i} className="p-4 rounded-lg bg-slate-900/60 border border-white/10">
              <div className="text-white font-medium">{m.name} <span className="text-blue-200/70 ml-2">${m.price?.toFixed?.(2)}</span></div>
              <div className="text-blue-200/80 text-sm">{m.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation form */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-3">Make a reservation</h3>
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-1">
            <label className="block text-xs text-blue-200/70 mb-1">Party size</label>
            <input type="number" min="1" max="20" value={partySize} onChange={e=>setPartySize(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-white/10 text-white text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-blue-200/70 mb-1">Date & time</label>
            <input type="datetime-local" value={dateTime} onChange={e=>setDateTime(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900/60 border border-white/10 text-white text-sm" />
          </div>
          <div className="sm:col-span-4">
            <label className="block text-xs text-blue-200/70 mb-1">Notes</label>
            <input value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Occasion, preferences..." className="w-full px-3 py-2 rounded bg-slate-900/60 border border-white/10 text-white text-sm" />
          </div>
          <div>
            <button onClick={reserve} className="px-4 py-2 rounded bg-emerald-500/80 hover:bg-emerald-500 text-white text-sm">Reserve</button>
          </div>
          {statusMsg && <div className="text-blue-200/90 text-sm">{statusMsg}</div>}
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Gallery</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {restaurant.images?.map((src, i) => (
            <img key={i} src={src} className="w-full h-32 object-cover rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
