import { supabase } from "../supabase";

// Starter/Fallback Data
export const STARTER_ITEMS = [
  {
    id: 1,
    name: "Scientific Calculator",
    category: "Study",
    type: "Borrow",
    description: "Casio fx-991EX scientific calculator for college maths, exams and engineering assignments. Fully functional.",
    owner: "Rahul",
    phone: "+919876543210",
    email: "rahul.belagavi@gmail.com",
    price: "Free to borrow",
    area: "Tilakwadi, Belagavi",
    lat: 15.8364,
    lng: 74.5028,
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=900&q=80",
    condition: "Like New",
    status: "available",
    contact_preference: "in_app_only",
  },
  {
    id: 2,
    name: "Mountain Bicycle (Gear Cycle)",
    category: "Others",
    type: "Borrow",
    description: "21-gear hybrid bicycle with helmet and lock included. Perfect for neighborhood rides or weekend commutes.",
    owner: "Arjun",
    phone: "+919876543211",
    email: "arjun.hindwadi@gmail.com",
    price: "Free to borrow",
    area: "Hindwadi, Belagavi",
    lat: 15.8458,
    lng: 74.5072,
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80",
    condition: "Good",
    status: "available",
    contact_preference: "in_app_only",
  },
  {
    id: 3,
    name: "Programming Books Bundle",
    category: "Study",
    type: "Donation",
    description: "DSA in Java, Clean Code, and JavaScript The Definitive Guide. Free donation for engineering students in need.",
    owner: "Ananya",
    phone: "+919876543212",
    email: "ananya.git@gmail.com",
    price: "Free donation",
    area: "KLE Tech / Angol, Belagavi",
    lat: 15.8264,
    lng: 74.5111,
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=900&q=80",
    condition: "Good",
    status: "available",
    contact_preference: "in_app_only",
  },
  {
    id: 4,
    name: "Cordless Power Drill",
    category: "Tools",
    type: "Borrow",
    description: "Handy 18V cordless drill with full bit set and extra battery. Perfect for assembling furniture and small repairs.",
    owner: "Kiran",
    phone: "+919876543213",
    email: "kiran.camp@gmail.com",
    price: "Free to borrow",
    area: "Camp, Belagavi",
    lat: 15.8582,
    lng: 74.5015,
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
    condition: "Like New",
    status: "available",
    contact_preference: "in_app_only",
  },
  {
    id: 5,
    name: "Study Desk Lamp",
    category: "Home",
    type: "Donation",
    description: "Adjustable 3-tone LED lamp with USB power cable. Clean condition, giving away to students.",
    owner: "Meera",
    phone: "+919876543214",
    email: "meera.shahapur@gmail.com",
    price: "Free donation",
    area: "Shahapur, Belagavi",
    lat: 15.8441,
    lng: 74.5232,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    condition: "Good",
    status: "available",
    contact_preference: "in_app_only",
  },
  {
    id: 6,
    name: "Hiking Daypack 35L",
    category: "Travel",
    type: "Borrow",
    description: "Waterproof trekking backpack with rain cover. Ideal for Belagavi Fort walks or Western Ghats weekend treks.",
    owner: "Vikram",
    phone: "+919876543215",
    email: "vikram.belagavi@gmail.com",
    price: "Free to borrow",
    area: "Rani Channamma Nagar, Belagavi",
    lat: 15.8682,
    lng: 74.5165,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
    condition: "Like New",
    status: "available",
    contact_preference: "in_app_only",
  },
];

export const STARTER_DONORS = [
  { id: 1, name: "Aarav Sharma", group: "O+", area: "Tilakwadi, Belagavi", contact_preference: "in_app_only", available: true, last_donated: "3 months ago", verified: true },
  { id: 2, name: "Diya Rao", group: "B+", area: "Hindwadi, Belagavi", contact_preference: "in_app_only", available: true, last_donated: "Ready to donate", verified: true },
  { id: 3, name: "Ishaan Nair", group: "A+", area: "Camp, Belagavi", contact_preference: "in_app_only", available: true, last_donated: "Ready to donate", verified: true },
  { id: 4, name: "Sara Khan", group: "O-", area: "Shahapur, Belagavi", contact_preference: "in_app_only", available: true, last_donated: "4 months ago (Universal Donor)", verified: true },
  { id: 5, name: "Karthik Verma", group: "AB+", area: "Angol, Belagavi", contact_preference: "in_app_only", available: true, last_donated: "Ready to donate", verified: false },
  { id: 6, name: "Pooja Hegde", group: "A-", area: "KLE Hospital Area, Belagavi", contact_preference: "in_app_only", available: true, last_donated: "Ready to donate", verified: true },
  { id: 7, name: "Naveen Gowda", group: "B-", area: "Vadgaon, Belagavi", contact_preference: "in_app_only", available: true, last_donated: "5 months ago", verified: false },
  { id: 8, name: "Tanvi Kulkarni", group: "AB-", area: "Channamma Circle, Belagavi", contact_preference: "in_app_only", available: true, last_donated: "Ready to donate", verified: true },
];

export const STARTER_URGENT_NEEDS = [
  {
    id: 1,
    title: "Need Crutches for Elderly Neighbor",
    category: "Medical",
    urgency: "urgent",
    description: "Neighbor recovering from ankle sprain needs adult crutches for 2 weeks in Tilakwadi.",
    area: "Tilakwadi, Belagavi",
    status: "open",
    requester_name: "Siddharth",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 2,
    title: "Car Battery Jumper Cables",
    category: "Vehicle",
    urgency: "critical",
    description: "Car battery drained near Camp Road. Need jumper cables for 10 minutes.",
    area: "Camp, Belagavi",
    status: "open",
    requester_name: "Praveen",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 3,
    title: "High-power Drill for Curtains Installation",
    category: "Tools",
    urgency: "normal",
    description: "Moving into new flat in Hindwadi. Need hammer drill for concrete wall for 2 hours.",
    area: "Hindwadi, Belagavi",
    status: "open",
    requester_name: "Divya",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export const STARTER_LOST_FOUND = [
  {
    id: 1,
    title: "House Keyring with Red Swiss Tag",
    type: "found",
    category: "Keys",
    location: "Vaccine Depot Ground Jogging Track",
    area: "Tilakwadi, Belagavi",
    date: "Today morning, 7:15 AM",
    description: "Found a bunch of 3 keys with a red Victorinox keychain on the track bench near south gate.",
    image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
    status: "open",
  },
  {
    id: 2,
    title: "Black Titan Watch Lost near Bakery",
    type: "lost",
    category: "Accessories",
    location: "Near Camp Road Bakery",
    area: "Camp, Belagavi",
    date: "Yesterday evening",
    description: "Black leather strap Titan chronograph. Sentimental gift from father. Reward offered if found.",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80",
    status: "open",
  },
];

// --- ITEMS API ---
export async function getItems() {
  try {
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      try {
        localStorage.setItem("lifelink_cached_items", JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (err) {
    console.warn("Using starter items fallback:", err.message);
  }
  try {
    const cached = localStorage.getItem("lifelink_cached_items");
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return STARTER_ITEMS;
}

export async function createItem(item) {
  const { data, error } = await supabase.from("items").insert([item]).select().single();
  if (error) throw error;
  return data;
}

// --- DONORS API ---
export async function getDonors() {
  try {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      try {
        localStorage.setItem("lifelink_cached_donors", JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (err) {
    console.warn("Using starter donors fallback:", err.message);
  }
  try {
    const cached = localStorage.getItem("lifelink_cached_donors");
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return STARTER_DONORS;
}

export async function createDonor(donor) {
  const { data, error } = await supabase.from("donors").insert([donor]).select().single();
  if (error) throw error;
  return data;
}

// --- SECURE BORROW REQUESTS VIA RPC ---
export async function createBorrowRequest({
  itemId,
  borrowerName,
  borrowerPhone,
  borrowerEmail,
  startDate,
  endDate,
  note,
  requestedDates,
  borrowerNote,
}) {
  const user = (await supabase.auth.getUser()).data?.user;
  const name = borrowerName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Neighbor";
  const phone = borrowerPhone || user?.user_metadata?.phone || "+919876543210";
  const email = borrowerEmail || user?.email || "borrower@lifelink.local";

  const today = new Date().toISOString().split("T")[0];
  const sDate = startDate || today;
  const in3Days = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
  const eDate = endDate || in3Days;
  const finalNote = (note || borrowerNote || "").trim();
  const reqDates = requestedDates || `${sDate} to ${eDate}`;

  // Execute secure RPC function
  const { data, error } = await supabase.rpc("create_borrow_request", {
    p_item_id: parseInt(itemId),
    p_borrower_name: name.trim(),
    p_borrower_phone: phone.trim(),
    p_borrower_email: email.trim(),
    p_start_date: sDate,
    p_return_date: eDate,
    p_note: finalNote,
  });

  if (error) {
    console.warn("create_borrow_request RPC call error:", error.message);
    // Fallback direct insert if RPC fails
    const { data: inserted, error: insertError } = await supabase
      .from("requests")
      .insert([
        {
          item_id: parseInt(itemId),
          borrower_id: user?.id || null,
          borrower_name: name.trim(),
          borrower_phone: phone.trim(),
          borrower_email: email.trim(),
          start_date: sDate,
          return_date: eDate,
          note: finalNote,
          borrower_note: finalNote,
          requested_dates: reqDates,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;
    return inserted;
  }

  if (data && data.success === false) {
    throw new Error(data.error || "Borrow request was rejected by server rules.");
  }

  return data;
}

export async function getUserRequests(userId) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("requests")
    .select("*, items(name, image, area, owner)")
    .eq("borrower_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Could not fetch user requests:", error.message);
    return [];
  }
  return data || [];
}

export async function getOwnerIncomingRequests(userId, ownerName = null) {
  if (!userId) return [];
  const { data, error } = await supabase
    .from("requests")
    .select("*, items(name, image, area, owner)")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (!error && data && data.length > 0) return data;

  if (ownerName) {
    const { data: byName } = await supabase
      .from("requests")
      .select("*, items!inner(name, image, area, owner)")
      .ilike("items.owner", `%${ownerName}%`)
      .order("created_at", { ascending: false });
    if (byName && byName.length > 0) return byName;
  }

  return data || [];
}

export async function approveRequest(requestId) {
  const { data, error } = await supabase.rpc("approve_borrow_request", {
    p_request_id: requestId,
  });
  if (error) {
    console.warn("approve_borrow_request RPC error, falling back:", error.message);
    const { data: fallback, error: fbErr } = await supabase
      .from("requests")
      .update({ status: "approved", updated_at: new Date().toISOString() })
      .eq("id", requestId)
      .select()
      .single();
    if (fbErr) throw fbErr;
    return fallback;
  }
  if (data && data.success === false) {
    throw new Error(data.error || "Approval failed.");
  }
  return data;
}

export async function rejectRequest(requestId, reason) {
  const { data, error } = await supabase.rpc("reject_borrow_request", {
    p_request_id: requestId,
    p_reason: reason || "Unavailable at this time",
  });
  if (error) {
    console.warn("reject_borrow_request RPC error, falling back:", error.message);
    const { data: fallback, error: fbErr } = await supabase
      .from("requests")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", requestId)
      .select()
      .single();
    if (fbErr) throw fbErr;
    return fallback;
  }
  if (data && data.success === false) {
    throw new Error(data.error || "Rejection failed.");
  }
  return data;
}

// --- SECURE HANDOVER VERIFICATION VIA RPC ---
export async function generateHandoverToken(requestId, stage) {
  const { data, error } = await supabase.rpc("generate_handover_token", {
    p_request_id: requestId,
    p_stage: stage, // 'pickup' or 'return'
  });
  if (error) throw error;
  return data; // Returns { token: '...', code: '...', expires_at: '...' }
}

export async function confirmHandover({ token, code }) {
  const cleanCode = (code || token || "").trim();
  const { data, error } = await supabase.rpc("confirm_handover", {
    p_code: cleanCode,
    p_token: null,
  });
  if (error) {
    console.error("confirm_handover RPC error:", error);
    throw error;
  }
  if (data && data.success === false) {
    throw new Error(data.error || "Handover verification failed.");
  }
  return data;
}

// --- URGENT NEEDS API ---
export async function getUrgentNeeds() {
  try {
    const { data, error } = await supabase
      .from("urgent_needs")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      try {
        localStorage.setItem("lifelink_cached_urgent_needs", JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (err) {
    console.warn("Using starter urgent needs fallback:", err.message);
  }
  try {
    const cached = localStorage.getItem("lifelink_cached_urgent_needs");
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return STARTER_URGENT_NEEDS;
}

export async function createUrgentNeed(need) {
  const { data, error } = await supabase.from("urgent_needs").insert([need]).select().single();
  if (error) throw error;
  return data;
}

// --- LOST & FOUND API ---
export async function getLostFound() {
  try {
    const { data, error } = await supabase
      .from("lost_found")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      try {
        localStorage.setItem("lifelink_cached_lost_found", JSON.stringify(data));
      } catch (e) {}
      return data;
    }
  } catch (err) {
    console.warn("Using starter lost/found fallback:", err.message);
  }
  try {
    const cached = localStorage.getItem("lifelink_cached_lost_found");
    if (cached) return JSON.parse(cached);
  } catch (e) {}
  return STARTER_LOST_FOUND;
}

export async function createLostFound(item) {
  const { data, error } = await supabase.from("lost_found").insert([item]).select().single();
  if (error) throw error;
  return data;
}

// --- NOTIFICATIONS API ---
export async function getNotifications(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) return data;
  } catch (err) {
    console.warn("Notifications load error:", err.message);
  }
  return [];
}

export async function markNotificationRead(id) {
  return await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}
