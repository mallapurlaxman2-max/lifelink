import { useMemo, useState, useEffect } from "react";
import "./App.css";

// Known local areas with reference coordinates
const AREA_COORDINATES = {
  "saraswathipuram": { lat: 12.302, lng: 76.635, name: "Saraswathipuram, Mysuru" },
  "gokulam": { lat: 12.333, lng: 76.626, name: "Gokulam, Mysuru" },
  "kuvempunagar": { lat: 12.285, lng: 76.628, name: "Kuvempunagar, Mysuru" },
  "jayalakshmipuram": { lat: 12.321, lng: 76.631, name: "Jayalakshmipuram, Mysuru" },
  "vijayanagar": { lat: 12.339, lng: 76.608, name: "Vijayanagar, Mysuru" },
  "jp nagar": { lat: 12.268, lng: 76.645, name: "JP Nagar, Mysuru" },
  "hebbal": { lat: 12.365, lng: 76.612, name: "Hebbal, Mysuru" },
  "mysuru": { lat: 12.2958, lng: 76.6394, name: "Mysuru City Center" },
  "bangalore": { lat: 12.9716, lng: 77.5946, name: "Bengaluru Central" },
};

const DEFAULT_USER_LOCATION = {
  name: "Mysuru Central",
  lat: 12.2958,
  lng: 76.6394,
  isGPS: false,
};

const STARTER_ITEMS = [
  {
    id: 1,
    name: "Scientific Calculator",
    category: "Study",
    type: "Borrow",
    description: "Casio fx-991EX scientific calculator for college maths, exams and engineering assignments. Fully functional.",
    owner: "Rahul",
    phone: "+919876543210",
    email: "rahul.mysuru@gmail.com",
    price: "Free to borrow",
    area: "Saraswathipuram, Mysuru",
    image:
      "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=900&q=85",
    lat: 12.302,
    lng: 76.635,
  },
  {
    id: 2,
    name: "City Bicycle",
    category: "Transport",
    type: "Borrow",
    description: "A comfortable hybrid bicycle with basket for short errands, market visits and college commute.",
    owner: "Arjun",
    phone: "+919845012345",
    email: "arjun.gokulam@gmail.com",
    price: "Free to borrow",
    area: "Gokulam, Mysuru",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=85",
    lat: 12.333,
    lng: 76.626,
  },
  {
    id: 3,
    name: "Programming Books Bundle",
    category: "Study",
    type: "Donate",
    description: "Useful textbooks and reference guides for Python, Data Structures, and Web Development. Free to keep.",
    owner: "Ananya",
    phone: "+919900112233",
    email: "ananya.study@gmail.com",
    price: "Free to keep",
    area: "Kuvempunagar, Mysuru",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
    lat: 12.285,
    lng: 76.628,
  },
  {
    id: 4,
    name: "Cordless Power Drill",
    category: "Tools",
    type: "Borrow",
    description: "Handy 18V cordless drill with full bit set and extra battery. Perfect for assembling furniture and small repairs.",
    owner: "Kiran",
    phone: "+919731234567",
    email: "kiran.diy@gmail.com",
    price: "Free to borrow",
    area: "Jayalakshmipuram, Mysuru",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=85",
    lat: 12.321,
    lng: 76.631,
  },
  {
    id: 5,
    name: "Study Desk Lamp",
    category: "Home",
    type: "Donate",
    description: "Adjustable 3-tone LED lamp with USB power cable. Clean condition, giving away to students.",
    owner: "Meera",
    phone: "+919886554433",
    email: "meera.home@gmail.com",
    price: "Free to keep",
    area: "JP Nagar, Mysuru",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    lat: 12.268,
    lng: 76.645,
  },
  {
    id: 6,
    name: "Sports Backpack 30L",
    category: "Everyday",
    type: "Borrow",
    description: "Spacious water-resistant backpack for college trips, weekend camping, or carrying sports equipment.",
    owner: "Vikram",
    phone: "+919448123456",
    email: "vikram.trips@gmail.com",
    price: "Free to borrow",
    area: "Vijayanagar, Mysuru",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    lat: 12.339,
    lng: 76.608,
  },
];

const BLOOD_GROUPS = ["All groups", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const STARTER_DONORS = [
  { id: 1, name: "Aarav Sharma", group: "O+", area: "Mysuru Central", available: true, phone: "+919876543210", email: "aarav.donor@gmail.com", lastDonated: "2 months ago" },
  { id: 2, name: "Diya Rao", group: "B+", area: "Saraswathipuram, Mysuru", available: true, phone: "+919448012345", email: "diya.donor@gmail.com", lastDonated: "4 months ago" },
  { id: 3, name: "Ishaan Nair", group: "A+", area: "Gokulam, Mysuru", available: false, phone: "+919108123456", email: "ishaan.donor@gmail.com", lastDonated: "1 week ago" },
  { id: 4, name: "Sara Khan", group: "O-", area: "Kuvempunagar, Mysuru", available: true, phone: "+919900987654", email: "sara.donor@gmail.com", lastDonated: "3 months ago" },
  { id: 5, name: "Karthik Verma", group: "AB+", area: "Jayalakshmipuram, Mysuru", available: true, phone: "+919741234567", email: "karthik.donor@gmail.com", lastDonated: "5 months ago" },
  { id: 6, name: "Pooja Hegde", group: "A-", area: "Vijayanagar, Mysuru", available: true, phone: "+919632123456", email: "pooja.donor@gmail.com", lastDonated: "3 months ago" },
  { id: 7, name: "Naveen Gowda", group: "B-", area: "Hebbal, Mysuru", available: false, phone: "+919535123456", email: "naveen.donor@gmail.com", lastDonated: "2 weeks ago" },
  { id: 8, name: "Tanvi Kulkarni", group: "AB-", area: "JP Nagar, Mysuru", available: true, phone: "+919341123456", email: "tanvi.donor@gmail.com", lastDonated: "6 months ago" },
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85";

// Haversine distance formula in kilometers
function getDistance(from, to) {
  if (!from || !to || from.lat == null || from.lng == null || to.lat == null || to.lng == null) return null;

  const rad = (number) => (number * Math.PI) / 180;
  const dLat = rad(to.lat - from.lat);
  const dLng = rad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(from.lat)) *
      Math.cos(rad(to.lat)) *
      Math.sin(dLng / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function distanceLabel(distance) {
  if (distance === null || distance === undefined) return "Distance unavailable";
  if (distance < 1) return `${Math.round(distance * 1000)} m away`;
  return `${distance.toFixed(1)} km away`;
}

function cleanPhoneNumber(phone) {
  if (!phone) return "";
  return phone.replace(/[^0-9]/g, "");
}

function App() {
  // Persistence with localStorage
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem("lifelink_items");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((item, idx) => ({
          ...item,
          area: item.area || STARTER_ITEMS[idx]?.area || "Saraswathipuram, Mysuru",
          phone: item.phone || STARTER_ITEMS[idx]?.phone || "+919876543210",
          email: item.email || STARTER_ITEMS[idx]?.email || "owner@lifelink.local",
          lat: item.lat ?? STARTER_ITEMS[idx]?.lat ?? 12.302,
          lng: item.lng ?? STARTER_ITEMS[idx]?.lng ?? 76.635,
        }));
      }
      return STARTER_ITEMS;
    } catch {
      return STARTER_ITEMS;
    }
  });

  const [donors, setDonors] = useState(() => {
    try {
      const saved = localStorage.getItem("lifelink_donors");
      return saved ? JSON.parse(saved) : STARTER_DONORS;
    } catch {
      return STARTER_DONORS;
    }
  });

  // User browsing location state
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("lifelink_user_location");
      return saved ? JSON.parse(saved) : DEFAULT_USER_LOCATION;
    } catch {
      return DEFAULT_USER_LOCATION;
    }
  });

  const [locationLoading, setLocationLoading] = useState(false);
  const [maxDistance, setMaxDistance] = useState("all");
  const [sortByNearest, setSortByNearest] = useState(true);

  // Filters and search
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDonorModal, setShowDonorModal] = useState(false);
  const [selectedDonorForContact, setSelectedDonorForContact] = useState(null);

  // Request modal form states
  const [requestModalItem, setRequestModalItem] = useState(null);
  const [requesterName, setRequesterName] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [requestDate, setRequestDate] = useState(new Date().toISOString().split("T")[0]);
  const [requestNote, setRequestNote] = useState("");
  const [toast, setToast] = useState("");

  // Blood donation filters
  const [bloodGroup, setBloodGroup] = useState("All groups");
  const [bloodSearch, setBloodSearch] = useState("");

  // New Item State with both phone and email
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Study",
    type: "Borrow",
    description: "",
    area: "Saraswathipuram, Mysuru",
    phone: "",
    email: "",
    lat: 12.302,
    lng: 76.635,
    image: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [detectingItemLocation, setDetectingItemLocation] = useState(false);

  // New Donor State
  const [newDonor, setNewDonor] = useState({
    name: "",
    group: "O+",
    area: "",
    phone: "",
    email: "",
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("lifelink_items", JSON.stringify(items));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem("lifelink_donors", JSON.stringify(donors));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [donors]);

  useEffect(() => {
    try {
      localStorage.setItem("lifelink_user_location", JSON.stringify(userLocation));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [userLocation]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    const isAnyModalOpen =
      showAddModal ||
      showDonorModal ||
      Boolean(selectedItem) ||
      Boolean(requestModalItem) ||
      Boolean(selectedDonorForContact);

    document.body.style.overflow = isAnyModalOpen ? "hidden" : "";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowAddModal(false);
        setShowDonorModal(false);
        setSelectedItem(null);
        setRequestModalItem(null);
        setSelectedDonorForContact(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showAddModal, showDonorModal, selectedItem, requestModalItem, selectedDonorForContact]);

  function showMessage(message) {
    setToast(message);
    window.clearTimeout(window._toastTimer);
    window._toastTimer = window.setTimeout(() => setToast(""), 4200);
  }

  // Detect live GPS for browsing user
  function detectUserGPS() {
    if (!navigator.geolocation) {
      showMessage("Geolocation is not supported by your browser. You can select your neighborhood.");
      return;
    }

    setLocationLoading(true);
    showMessage("Locating your position via GPS…");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        let detectedName = "Your GPS Location";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            const sub = data.address?.suburb || data.address?.neighbourhood || data.address?.residential || data.address?.city || data.address?.town;
            const city = data.address?.city || data.address?.town || data.address?.county || "Nearby";
            detectedName = sub ? `${sub}, ${city}` : city;
          }
        } catch {
          // fallback
        }

        setUserLocation({
          name: detectedName,
          lat,
          lng,
          isGPS: true,
        });
        setLocationLoading(false);
        showMessage(`📍 Location set to ${detectedName}! Items sorted by closest distance.`);
      },
      () => {
        setLocationLoading(false);
        showMessage("Could not access GPS. You can manually choose your neighborhood.");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
    );
  }

  // Detect GPS specifically when adding an item
  function detectItemLocationGPS() {
    if (!navigator.geolocation) {
      showMessage("GPS not supported. Please type your area name.");
      return;
    }

    setDetectingItemLocation(true);
    showMessage("Detecting item pickup location…");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let areaName = "Near My Current Location";

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            const sub = data.address?.suburb || data.address?.neighbourhood || data.address?.residential || data.address?.city;
            const city = data.address?.city || data.address?.town || "Local Area";
            areaName = sub ? `${sub}, ${city}` : city;
          }
        } catch {
          // fallback
        }

        setNewItem((prev) => ({
          ...prev,
          area: areaName,
          lat,
          lng,
        }));
        setDetectingItemLocation(false);
        showMessage(`📍 Item location detected: ${areaName}`);
      },
      () => {
        setDetectingItemLocation(false);
        showMessage("GPS access denied. You can manually enter your neighborhood name.");
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  // Handle manual location change for browsing
  function handleManualLocationChange(e) {
    const selectedKey = e.target.value.toLowerCase();
    if (AREA_COORDINATES[selectedKey]) {
      const match = AREA_COORDINATES[selectedKey];
      setUserLocation({
        name: match.name,
        lat: match.lat,
        lng: match.lng,
        isGPS: false,
      });
      showMessage(`📍 Browsing location changed to ${match.name}`);
    }
  }

  // Filter and sort items based on distance and queries
  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = items.map((item) => {
      const dist = getDistance(userLocation, item);
      return {
        ...item,
        distance: dist,
      };
    });

    result = result.filter((item) => {
      const matchesFilter =
        activeFilter === "All" || item.type === activeFilter;
      const matchesCategory =
        category === "All categories" || item.category === category;
      const matchesSearch =
        !query ||
        `${item.name} ${item.category} ${item.description} ${item.owner} ${item.area}`
          .toLowerCase()
          .includes(query);

      let matchesDistance = true;
      if (maxDistance !== "all" && item.distance !== null) {
        matchesDistance = item.distance <= parseFloat(maxDistance);
      }

      return matchesFilter && matchesCategory && matchesSearch && matchesDistance;
    });

    if (sortByNearest) {
      result.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return result;
  }, [items, activeFilter, category, search, userLocation, maxDistance, sortByNearest]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("Please select an image file (JPG, PNG or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Please choose an image smaller than 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result));
      setNewItem((current) => ({
        ...current,
        image: String(reader.result),
      }));
    };
    reader.readAsDataURL(file);
  }

  function addItem(event) {
    event.preventDefault();

    if (!newItem.name.trim()) {
      showMessage("Please enter an item name.");
      return;
    }

    if (!newItem.area.trim()) {
      showMessage("Please enter the pickup location/neighborhood.");
      return;
    }

    if (!newItem.phone.trim() && !newItem.email.trim()) {
      showMessage("Please enter at least your WhatsApp phone or email so borrowers can notify you.");
      return;
    }

    let finalLat = newItem.lat;
    let finalLng = newItem.lng;

    const lowerArea = newItem.area.toLowerCase().trim();
    for (const [key, val] of Object.entries(AREA_COORDINATES)) {
      if (lowerArea.includes(key)) {
        finalLat = val.lat + (Math.random() - 0.5) * 0.005;
        finalLng = val.lng + (Math.random() - 0.5) * 0.005;
        break;
      }
    }

    const item = {
      ...newItem,
      id: Date.now(),
      name: newItem.name.trim(),
      description: newItem.description.trim() || "Shared with the local community.",
      owner: "You",
      price: newItem.type === "Borrow" ? "Free to borrow" : "Free to keep",
      area: newItem.area.trim(),
      phone: newItem.phone.trim() || "+919876543210",
      email: newItem.email.trim() || "you@community.local",
      lat: finalLat,
      lng: finalLng,
      image:
        newItem.image ||
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
    };

    setItems((current) => [item, ...current]);
    setShowAddModal(false);
    setNewItem({
      name: "",
      category: "Study",
      type: "Borrow",
      description: "",
      area: userLocation.name || "Saraswathipuram, Mysuru",
      phone: "",
      email: "",
      lat: userLocation.lat,
      lng: userLocation.lng,
      image: "",
    });
    setImagePreview("");
    setActiveFilter("All");
    setSearch("");
    showMessage(`🎉 "${item.name}" listed at ${item.area}! You will be notified on WhatsApp or Email when requested.`);
  }

  function openRequestDialog(item) {
    setSelectedItem(null);
    setRequestModalItem(item);
    setRequesterName("");
    setRequesterPhone("");
    setRequestDate(new Date().toISOString().split("T")[0]);
    setRequestNote(`Hi ${item.owner}, I would like to ${item.type.toLowerCase()} your "${item.name}". Please let me know if it's available!`);
  }

  // Construct message text
  function generateRequestMessage() {
    if (!requestModalItem) return "";
    const nameStr = requesterName.trim() || "A nearby neighbor";
    const phoneStr = requesterPhone.trim() ? ` (Phone: ${requesterPhone.trim()})` : "";
    return `Hello ${requestModalItem.owner}! 👋\n\nI saw your listing on LifeLink: "${requestModalItem.name}" in ${requestModalItem.area}.\n\nI would love to ${requestModalItem.type.toLowerCase()} it starting on ${requestDate}.\nMy name: ${nameStr}${phoneStr}\nNote: ${requestNote.trim()}\n\nPlease let me know when and where we can meet. Thank you!`;
  }

  // Send via WhatsApp
  function notifyViaWhatsApp(e) {
    e.preventDefault();
    if (!requestModalItem) return;

    const message = generateRequestMessage();
    const cleanPhone = cleanPhoneNumber(requestModalItem.phone || "919876543210");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
    showMessage(`Opening WhatsApp to notify ${requestModalItem.owner} directly!`);
    setRequestModalItem(null);
  }

  // Send via Email
  function notifyViaEmail(e) {
    e.preventDefault();
    if (!requestModalItem) return;

    const subject = `LifeLink: Borrow Request for "${requestModalItem.name}"`;
    const message = generateRequestMessage();
    const mailtoUrl = `mailto:${requestModalItem.email || "owner@lifelink.local"}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;

    window.location.href = mailtoUrl;
    showMessage(`Opening your Email app to notify ${requestModalItem.owner}!`);
    setRequestModalItem(null);
  }

  function registerDonor(e) {
    e.preventDefault();
    if (!newDonor.name.trim() || !newDonor.area.trim()) {
      showMessage("Please fill in your name and neighborhood area.");
      return;
    }

    const donor = {
      id: Date.now(),
      name: newDonor.name.trim(),
      group: newDonor.group,
      area: newDonor.area.trim(),
      phone: newDonor.phone.trim() || "+919876543210",
      email: newDonor.email.trim() || "donor@community.local",
      available: true,
      lastDonated: "Ready to donate",
    };

    setDonors((prev) => [donor, ...prev]);
    setShowDonorModal(false);
    setBloodGroup(donor.group);
    setNewDonor({ name: "", group: "O+", area: "", phone: "", email: "" });
    showMessage(`Thank you, ${donor.name}! You are registered with WhatsApp & Email notifications.`);
  }

  const visibleDonors = donors.filter((donor) => {
    const matchesGroup =
      bloodGroup === "All groups" || donor.group === bloodGroup;
    const matchesArea =
      !bloodSearch.trim() ||
      donor.area.toLowerCase().includes(bloodSearch.trim().toLowerCase());
    return matchesGroup && matchesArea;
  });

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a href="#home" className="brand" aria-label="LifeLink home">
          <span className="brand-symbol">L</span>
          <span>
            LifeLink
            <small>GOOD THINGS, SHARED</small>
          </span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#marketplace">Marketplace</a>
          <a href="#how-it-works">How it works</a>
          <a href="#blood-donation">Blood donation</a>
        </nav>

        <div className="header-actions">
          <button className="button button-dark nav-button" onClick={() => setShowAddModal(true)}>
            <span>＋</span> Share an item
          </button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero section-wrap" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" />
              LOCATION & DIRECT NOTIFICATIONS
            </div>

            <h1>
              Borrow & Give
              <br />
              from <span>nearby</span> neighbors.
            </h1>

            <p className="hero-description">
              Find calculators, books, tools, and bicycles near you. When you request an item,
              the owner gets <strong>instant notifications directly via WhatsApp and Email</strong> to arrange pickup.
            </p>

            <div className="hero-actions">
              <a href="#marketplace" className="button button-dark">
                Explore nearby items <span>↘</span>
              </a>
              <button
                className="button button-light"
                onClick={() => setShowAddModal(true)}
              >
                Share an item
              </button>
            </div>

            <div className="hero-trust">
              <div className="avatar-stack" aria-hidden="true">
                <span>R</span>
                <span>A</span>
                <span>M</span>
                <span>+</span>
              </div>
              <p>
                <strong>Zero buying. Direct connection.</strong>
                <span>Instant notifications via WhatsApp & Email so owners never miss a request.</span>
              </p>
            </div>
          </div>

          <div className="hero-visual" aria-label="Visual of community items">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-photo-card hero-photo-main">
              <img
                src="https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85"
                alt="Community items"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
              />
              <div className="photo-caption">
                <span className="caption-icon">📱</span>
                <span>
                  <strong>Instant Owner Alert</strong>
                  <small>Direct WhatsApp ping & Email notifications</small>
                </span>
              </div>
            </div>
            <div className="floating-note note-top">
              <span className="note-icon">💬</span>
              <span>
                <strong>WhatsApp integrated</strong>
                <small>Chat directly to borrow</small>
              </span>
            </div>
            <div className="floating-note note-bottom">
              <span className="note-icon note-blue">⌖</span>
              <span>
                <strong>Sorted by proximity</strong>
                <small>Closest items first</small>
              </span>
            </div>
            <div className="hero-spark spark-one">✳</div>
            <div className="hero-spark spark-two">✳</div>
          </div>
        </section>

        {/* Impact strip */}
        <section className="impact-strip section-wrap" aria-label="LifeLink values">
          <div className="impact-item">
            <span className="impact-icon">⌖</span>
            <span>
              <strong>Nearby First</strong>
              <small>Live distance calculation to every item</small>
            </span>
          </div>
          <div className="impact-item">
            <span className="impact-icon">🔔</span>
            <span>
              <strong>WhatsApp & Email Alerts</strong>
              <small>Owners receive requests instantly on their phone</small>
            </span>
          </div>
          <div className="impact-item">
            <span className="impact-icon">♡</span>
            <span>
              <strong>Emergency Blood Donors</strong>
              <small>Direct contact via phone, WhatsApp & email</small>
            </span>
          </div>
        </section>

        {/* Marketplace Section */}
        <section className="marketplace section-wrap" id="marketplace">
          <div className="section-heading">
            <div>
              <div className="eyebrow">THE COMMUNITY SHELF</div>
              <h2>Items available nearby.</h2>
              <p>Everything listed here includes the exact neighborhood and distance from you.</p>
            </div>
            <button
              className="button button-outline"
              onClick={() => setShowAddModal(true)}
            >
              ＋ Share an item
            </button>
          </div>

          {/* Interactive User Location Bar */}
          <div className="user-location-bar">
            <div className="current-location-pill">
              <span className="location-pin-icon">📍</span>
              <div className="location-text">
                <small>YOUR CURRENT BROWSING LOCATION</small>
                <strong>{userLocation.name}</strong>
              </div>
            </div>

            <div className="location-actions">
              <button
                type="button"
                className={`button button-location-gps ${userLocation.isGPS ? "gps-active" : ""}`}
                onClick={detectUserGPS}
                disabled={locationLoading}
                title="Get your live GPS coordinates"
              >
                <span>⌖</span>
                {locationLoading ? "Detecting GPS…" : userLocation.isGPS ? "Live GPS Active" : "Detect My Live GPS"}
              </button>

              <label className="location-select-wrap">
                <span>Or select area:</span>
                <select onChange={handleManualLocationChange} defaultValue="">
                  <option value="" disabled>Choose neighborhood...</option>
                  <option value="saraswathipuram">Saraswathipuram</option>
                  <option value="gokulam">Gokulam</option>
                  <option value="kuvempunagar">Kuvempunagar</option>
                  <option value="jayalakshmipuram">Jayalakshmipuram</option>
                  <option value="vijayanagar">Vijayanagar</option>
                  <option value="jp nagar">JP Nagar</option>
                  <option value="hebbal">Hebbal</option>
                  <option value="mysuru">Mysuru Central</option>
                  <option value="bangalore">Bengaluru Central</option>
                </select>
              </label>
            </div>
          </div>

          {/* Search and Distance Radius Controls */}
          <div className="search-panel">
            <label className="search-box">
              <span className="search-icon">⌕</span>
              <input
                type="search"
                placeholder="Search by item name, category, or area (e.g. Gokulam)..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search items"
              />
              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>

            <div className="radius-control">
              <label>
                <span>Max distance:</span>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(e.target.value)}
                >
                  <option value="all">Any distance</option>
                  <option value="2">Within 2 km (Walking)</option>
                  <option value="5">Within 5 km (Short drive)</option>
                  <option value="10">Within 10 km (City wide)</option>
                  <option value="25">Within 25 km (Greater area)</option>
                </select>
              </label>
            </div>
          </div>

          {/* Category Tabs & Sorting */}
          <div className="market-controls">
            <div className="filter-tabs" role="group" aria-label="Filter items">
              {["All", "Borrow", "Donate"].map((filter) => (
                <button
                  key={filter}
                  className={activeFilter === filter ? "filter-active" : ""}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                  {filter === "All" && <span>{items.length}</span>}
                </button>
              ))}
            </div>

            <div className="secondary-controls">
              <label className="category-select">
                <span>Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option>All categories</option>
                  <option>Study</option>
                  <option>Transport</option>
                  <option>Tools</option>
                  <option>Home</option>
                  <option>Everyday</option>
                </select>
              </label>

              <button
                type="button"
                className={`sort-button ${sortByNearest ? "sort-active" : ""}`}
                onClick={() => setSortByNearest(!sortByNearest)}
                title="Toggle nearest items first"
              >
                ⌖ {sortByNearest ? "Sorted: Closest First" : "Default Order"}
              </button>
            </div>
          </div>

          {/* Items Grid */}
          <div className="item-grid">
            {filteredItems.map((item, index) => (
              <article
                className="item-card"
                key={item.id}
                style={{ "--card-index": index }}
              >
                <button
                  className="item-image"
                  onClick={() => setSelectedItem(item)}
                  aria-label={`View details for ${item.name}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                  <span className={`item-type ${item.type.toLowerCase()}`}>
                    {item.type === "Borrow" ? "Available to borrow" : "Free donation"}
                  </span>

                  <span className="item-distance-tag">
                    📍 {distanceLabel(item.distance)}
                  </span>

                  <span className="image-arrow">↗</span>
                </button>

                <div className="item-card-content">
                  <div className="item-meta">
                    <span className="item-badge">{item.category}</span>
                    <span className="item-location-label" title={item.area}>
                      📍 {item.area}
                    </span>
                  </div>

                  <button
                    className="item-title"
                    onClick={() => setSelectedItem(item)}
                  >
                    {item.name}
                  </button>

                  <p>{item.description}</p>

                  <div className="item-card-footer">
                    <span className="owner-avatar">
                      {item.owner.charAt(0).toUpperCase()}
                    </span>
                    <div className="owner-info">
                      <span className="owner-name">{item.owner}</span>
                      <small className="owner-area">📱 Direct WhatsApp / Email</small>
                    </div>
                    <button
                      className="card-action"
                      onClick={() => setSelectedItem(item)}
                      aria-label={`See details for ${item.name}`}
                    >
                      →
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="empty-state">
              <span>⌕</span>
              <h3>No items found in this distance radius</h3>
              <p>Try switching "Max distance" to <strong>Any distance</strong> or clear the search filters.</p>
              <button
                className="button button-light"
                onClick={() => {
                  setSearch("");
                  setMaxDistance("all");
                  setCategory("All categories");
                  setActiveFilter("All");
                }}
              >
                Show all community items
              </button>
            </div>
          )}

          <div className="community-shelf-meta">
            <p className="demo-note">
              <span>ⓘ</span> <strong>Direct Alerts:</strong> When you click Request on any item, it lets you send a direct notification via WhatsApp or Email.
            </p>
            <button
              className="text-action-link"
              onClick={() => {
                if (window.confirm("Reset items to sample defaults?")) {
                  setItems(STARTER_ITEMS);
                  showMessage("Restored default community items.");
                }
              }}
            >
              Reset sample listings
            </button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-section" id="how-it-works">
          <div className="section-wrap">
            <div className="section-heading centered-heading">
              <div>
                <div className="eyebrow">SIMPLE & LOCAL</div>
                <h2>How instant notifications work</h2>
                <p>Never wait in the dark. Connect with owners immediately.</p>
              </div>
            </div>

            <div className="steps-grid">
              <article className="step-card">
                <span className="step-number">01</span>
                <div className="step-icon">📍</div>
                <h3>Browse by distance</h3>
                <p>See items shared right in your neighborhood, sorted from closest to farthest from your door.</p>
              </article>
              <article className="step-card">
                <span className="step-number">02</span>
                <div className="step-icon">💬</div>
                <h3>1-Click WhatsApp Alert</h3>
                <p>Click Request to open WhatsApp with a pre-written borrow note. The owner’s phone buzzes instantly.</p>
              </article>
              <article className="step-card">
                <span className="step-number">03</span>
                <div className="step-icon">✉️</div>
                <h3>Email notification</h3>
                <p>Prefer email? Send an immediate email draft with your requested dates and pickup preferences.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Blood Donation Section */}
        <section className="blood-section section-wrap" id="blood-donation">
          <div className="blood-card">
            <div className="blood-copy">
              <div className="eyebrow blood-eyebrow">
                <span className="blood-pulse">+</span>
                LOCAL EMERGENCY NETWORK
              </div>
              <h2>
                Some things are shared.
                <br />
                <span>Some things save lives.</span>
              </h2>
              <p>
                LifeLink connects patients and hospitals with verified blood donors registered
                right in your immediate city. Reach donors immediately via WhatsApp or direct email.
              </p>
              <div className="blood-cta-group">
                <a href="#donor-search" className="button button-dark">
                  Find blood donors <span>↘</span>
                </a>
                <button
                  className="button button-outline"
                  onClick={() => setShowDonorModal(true)}
                >
                  Register as donor +
                </button>
              </div>
              <small className="blood-safety">
                Blood donations must always follow certified healthcare safety protocols at verified clinics or hospitals.
              </small>
            </div>

            <div className="blood-visual">
              <div className="blood-orbit" />
              <div className="blood-drop">
                <span>+</span>
              </div>
              <div className="blood-mini-card">
                <span className="mini-blood-icon">+</span>
                <span>
                  <strong>Gift of life</strong>
                  <small>Donate safely. Save someone.</small>
                </span>
              </div>
              <span className="blood-star blood-star-one">✳</span>
              <span className="blood-star blood-star-two">✧</span>
            </div>
          </div>

          <div className="donor-search" id="donor-search">
            <div className="donor-heading-wrap">
              <div className="donor-heading">
                <div className="eyebrow">BLOOD GROUP DIRECTORY</div>
                <h3>Find or Register Blood Donors</h3>
                <p>
                  Search by blood group and neighborhood area, or register with your contact info to help in medical emergencies.
                </p>
              </div>
              <button
                className="button button-light donor-reg-btn"
                onClick={() => setShowDonorModal(true)}
              >
                ＋ Join donor directory
              </button>
            </div>

            <div className="donor-form">
              <label>
                Blood group
                <select
                  value={bloodGroup}
                  onChange={(event) => setBloodGroup(event.target.value)}
                >
                  {BLOOD_GROUPS.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </label>
              <label>
                City or neighborhood
                <input
                  value={bloodSearch}
                  onChange={(event) => setBloodSearch(event.target.value)}
                  placeholder="e.g. Saraswathipuram, Gokulam, Kuvempunagar..."
                />
              </label>
            </div>

            <div className="donor-results">
              <div className="donor-results-heading">
                <strong>Registered Community Donors</strong>
                <span>{visibleDonors.length} matching record{visibleDonors.length === 1 ? "" : "s"}</span>
              </div>

              {visibleDonors.length ? (
                <div className="donor-list">
                  {visibleDonors.map((donor) => (
                    <div className="donor-row" key={donor.id || donor.name}>
                      <span className="donor-avatar">+</span>
                      <div className="donor-person">
                        <div className="donor-name-row">
                          <strong>{donor.name}</strong>
                          <span
                            className={`availability ${
                              donor.available ? "available" : "unconfirmed"
                            }`}
                          >
                            ● {donor.available ? "Ready to donate" : "Recent donation"}
                          </span>
                        </div>
                        <small>📍 {donor.area} · {donor.lastDonated || "Verified profile"}</small>
                      </div>
                      <span className="blood-group-pill">{donor.group}</span>
                      <button
                        className="button-contact-donor"
                        onClick={() => setSelectedDonorForContact(donor)}
                      >
                        Contact Donor 💬
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-donors">
                  No donors match those criteria. Try selecting "All groups" or click "Join donor directory" to register.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Closing Call to Action */}
        <section className="closing-section section-wrap">
          <div>
            <div className="eyebrow">HELP YOUR LOCAL COMMUNITY</div>
            <h2>Have something useful to share?</h2>
            <p>List it in 30 seconds and receive instant borrow notifications when a neighbor needs it.</p>
          </div>
          <button className="button button-dark" onClick={() => setShowAddModal(true)}>
            Share an item from your area <span>↗</span>
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <a href="#home" className="brand footer-brand">
          <span className="brand-symbol">L</span>
          <span>
            LifeLink
            <small>GOOD THINGS, SHARED</small>
          </span>
        </a>
        <p>Connecting neighborhoods through sustainable sharing.</p>
        <a href="#home" className="back-top">
          Back to top ↑
        </a>
      </footer>

      {/* Share / Add Item Modal with Phone & Email */}
      {showAddModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAddModal(false);
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-item-title"
          >
            <div className="modal-header">
              <div>
                <div className="eyebrow">PASS IT FORWARD</div>
                <h2 id="add-item-title">Share an item</h2>
                <p>Provide your contact details so borrowers can notify you instantly.</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowAddModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="add-item-form" onSubmit={addItem}>
              <label>
                Item name *
                <input
                  required
                  value={newItem.name}
                  onChange={(event) =>
                    setNewItem({ ...newItem, name: event.target.value })
                  }
                  placeholder="e.g. Scientific Calculator, Camping Tent, Cordless Drill"
                />
              </label>

              {/* LOCATION PICKER */}
              <div className="modal-location-group">
                <div className="modal-location-header">
                  <label htmlFor="item-area-input">
                    Pickup Location / Area *
                  </label>
                  <button
                    type="button"
                    className="button-detect-small"
                    onClick={detectItemLocationGPS}
                    disabled={detectingItemLocation}
                  >
                    📍 {detectingItemLocation ? "Detecting GPS…" : "Detect Current GPS"}
                  </button>
                </div>
                <input
                  id="item-area-input"
                  required
                  value={newItem.area}
                  onChange={(event) =>
                    setNewItem({ ...newItem, area: event.target.value })
                  }
                  placeholder="e.g. Gokulam, Saraswathipuram, Kuvempunagar, Indiranagar..."
                />
              </div>

              {/* CONTACT DETAILS FOR NOTIFICATIONS */}
              <div className="contact-inputs-card">
                <div className="contact-card-title">
                  <span>🔔</span>
                  <div>
                    <strong>Your Notification Details (Required)</strong>
                    <small>Borrowers will notify you here when they want this item.</small>
                  </div>
                </div>

                <div className="form-row">
                  <label>
                    Your WhatsApp / Phone Number *
                    <input
                      type="tel"
                      required
                      value={newItem.phone}
                      onChange={(e) =>
                        setNewItem({ ...newItem, phone: e.target.value })
                      }
                      placeholder="e.g. +91 98765 43210"
                    />
                  </label>
                  <label>
                    Your Notification Email *
                    <input
                      type="email"
                      required
                      value={newItem.email}
                      onChange={(e) =>
                        setNewItem({ ...newItem, email: e.target.value })
                      }
                      placeholder="e.g. rahul@gmail.com"
                    />
                  </label>
                </div>
              </div>

              <div className="form-row">
                <label>
                  Listing type
                  <select
                    value={newItem.type}
                    onChange={(event) =>
                      setNewItem({ ...newItem, type: event.target.value })
                    }
                  >
                    <option value="Borrow">Borrow (return later)</option>
                    <option value="Donate">Donate (free to keep)</option>
                  </select>
                </label>
                <label>
                  Category
                  <select
                    value={newItem.category}
                    onChange={(event) =>
                      setNewItem({ ...newItem, category: event.target.value })
                    }
                  >
                    <option>Study</option>
                    <option>Transport</option>
                    <option>Tools</option>
                    <option>Home</option>
                    <option>Everyday</option>
                  </select>
                </label>
              </div>

              <label>
                Short description
                <textarea
                  rows="3"
                  value={newItem.description}
                  onChange={(event) =>
                    setNewItem({ ...newItem, description: event.target.value })
                  }
                  placeholder="Tell neighbors about the condition, accessories, and pickup instructions..."
                />
              </label>

              <label className="upload-label">
                Item photo
                <span className="upload-box">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview of item" />
                  ) : (
                    <>
                      <span className="upload-icon">＋</span>
                      <strong>Choose a photo from your device</strong>
                      <small>JPG, PNG or WebP · up to 5 MB</small>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </span>
              </label>

              <button className="button button-dark submit-button" type="submit">
                List item on community shelf <span>↗</span>
              </button>
            </form>
          </section>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedItem(null);
          }}
        >
          <section className="detail-modal" role="dialog" aria-modal="true">
            <button
              className="modal-close detail-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Close"
            >
              ×
            </button>
            <img
              className="detail-image"
              src={selectedItem.image}
              alt={selectedItem.name}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            <div className="detail-content">
              <span className={`item-type ${selectedItem.type.toLowerCase()}`}>
                {selectedItem.type === "Borrow" ? "Available to borrow" : "Free donation"}
              </span>
              <h2>{selectedItem.name}</h2>
              <p>{selectedItem.description}</p>

              <div className="detail-info-row">
                <span>Pickup Location</span>
                <strong>📍 {selectedItem.area}</strong>
              </div>

              <div className="detail-info-row">
                <span>Distance from you</span>
                <strong className="distance-highlight">
                  {distanceLabel(selectedItem.distance)}
                </strong>
              </div>

              <div className="detail-info-row">
                <span>Shared by</span>
                <strong>{selectedItem.owner}</strong>
              </div>

              <div className="detail-info-row">
                <span>Notifications supported</span>
                <strong style={{ color: "#2b8478" }}>✓ WhatsApp & Email alerts</strong>
              </div>

              <div className="detail-info-row">
                <span>Cost</span>
                <strong className="free-tag">{selectedItem.price}</strong>
              </div>

              <button
                className="button button-dark submit-button"
                onClick={() => openRequestDialog(selectedItem)}
              >
                {selectedItem.type === "Borrow" ? "Request to borrow" : "Request donation item"}
                <span>↗</span>
              </button>
              <p className="form-disclaimer">
                Connects directly with {selectedItem.owner} via WhatsApp or Email.
              </p>
            </div>
          </section>
        </div>
      )}

      {/* Interactive Request & Direct Notification Dialog */}
      {requestModalItem && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRequestModalItem(null);
          }}
        >
          <section className="modal-card" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <div className="eyebrow">DIRECT NOTIFICATION TO OWNER</div>
                <h2>Request "{requestModalItem.name}"</h2>
                <p>
                  Owner: <strong>{requestModalItem.owner}</strong> · 📍 {requestModalItem.area}
                </p>
              </div>
              <button
                className="modal-close"
                onClick={() => setRequestModalItem(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="request-flow-box">
              <div className="flow-badge">
                <span>🔔</span>
                <small>Choose how you want to notify {requestModalItem.owner}:</small>
              </div>

              <form className="add-item-form">
                <div className="form-row">
                  <label>
                    Your Name *
                    <input
                      required
                      value={requesterName}
                      onChange={(e) => setRequesterName(e.target.value)}
                      placeholder="e.g. Aditi Sharma"
                    />
                  </label>
                  <label>
                    Your Phone Number (Optional)
                    <input
                      type="tel"
                      value={requesterPhone}
                      onChange={(e) => setRequesterPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                    />
                  </label>
                </div>

                <label>
                  Preferred Pickup Date
                  <input
                    type="date"
                    value={requestDate}
                    onChange={(e) => setRequestDate(e.target.value)}
                  />
                </label>

                <label>
                  Your Message to {requestModalItem.owner}
                  <textarea
                    rows="3"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="Introduce yourself and specify when you'd like to pick up and return the item..."
                  />
                </label>

                <div className="dual-action-buttons">
                  <button
                    type="button"
                    className="button button-whatsapp"
                    onClick={notifyViaWhatsApp}
                  >
                    <span>💬</span> Notify on WhatsApp
                  </button>

                  <button
                    type="button"
                    className="button button-email"
                    onClick={notifyViaEmail}
                  >
                    <span>✉️</span> Notify via Email
                  </button>
                </div>

                <p className="form-disclaimer">
                  Clicking either button opens your WhatsApp or Email app with a pre-written message to {requestModalItem.owner}!
                </p>
              </form>
            </div>
          </section>
        </div>
      )}

      {/* Contact Donor Modal */}
      {selectedDonorForContact && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedDonorForContact(null);
          }}
        >
          <section className="modal-card" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <div className="eyebrow blood-eyebrow">EMERGENCY CONTACT</div>
                <h2>Connect with {selectedDonorForContact.name}</h2>
                <p>Blood Group: <strong>{selectedDonorForContact.group}</strong> · 📍 {selectedDonorForContact.area}</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedDonorForContact(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="donor-contact-options">
              <a
                href={`https://wa.me/${cleanPhoneNumber(selectedDonorForContact.phone || "919876543210")}?text=${encodeURIComponent(`Hello ${selectedDonorForContact.name}, I found your contact on LifeLink. We have an urgent requirement for ${selectedDonorForContact.group} blood in ${selectedDonorForContact.area}. Are you available?`)}`}
                target="_blank"
                rel="noreferrer"
                className="button button-whatsapp"
                style={{ width: "100%", textDecoration: "none" }}
              >
                <span>💬</span> WhatsApp {selectedDonorForContact.name}
              </a>

              <a
                href={`mailto:${selectedDonorForContact.email || "donor@lifelink.local"}?subject=${encodeURIComponent(`Urgent: Blood Donation Request (${selectedDonorForContact.group})`)}&body=${encodeURIComponent(`Hello ${selectedDonorForContact.name},\n\nWe urgently require ${selectedDonorForContact.group} blood in ${selectedDonorForContact.area}. Please contact us if you are available to donate.\n\nThank you!`)}`}
                className="button button-email"
                style={{ width: "100%", textDecoration: "none" }}
              >
                <span>✉️</span> Send Emergency Email
              </a>

              <a
                href={`tel:${cleanPhoneNumber(selectedDonorForContact.phone || "919876543210")}`}
                className="button button-outline"
                style={{ width: "100%", textDecoration: "none" }}
              >
                <span>📞</span> Direct Phone Call ({selectedDonorForContact.phone})
              </a>
            </div>
          </section>
        </div>
      )}

      {/* Register As Blood Donor Modal */}
      {showDonorModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowDonorModal(false);
          }}
        >
          <section className="modal-card" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <div className="eyebrow blood-eyebrow">SAVE A LIFE</div>
                <h2>Register as Blood Donor</h2>
                <p>Join your local neighborhood emergency donor network.</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowDonorModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="add-item-form" onSubmit={registerDonor}>
              <label>
                Full Name *
                <input
                  required
                  value={newDonor.name}
                  onChange={(e) => setNewDonor({ ...newDonor, name: e.target.value })}
                  placeholder="e.g. Aditi Sharma"
                />
              </label>

              <div className="form-row">
                <label>
                  Blood Group *
                  <select
                    value={newDonor.group}
                    onChange={(e) => setNewDonor({ ...newDonor, group: e.target.value })}
                  >
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </label>
                <label>
                  City / Neighborhood Area *
                  <input
                    required
                    value={newDonor.area}
                    onChange={(e) => setNewDonor({ ...newDonor, area: e.target.value })}
                    placeholder="e.g. Saraswathipuram, Mysuru"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  WhatsApp / Contact Phone *
                  <input
                    type="tel"
                    required
                    value={newDonor.phone}
                    onChange={(e) => setNewDonor({ ...newDonor, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                  />
                </label>
                <label>
                  Notification Email *
                  <input
                    type="email"
                    required
                    value={newDonor.email}
                    onChange={(e) => setNewDonor({ ...newDonor, email: e.target.value })}
                    placeholder="e.g. donor@gmail.com"
                  />
                </label>
              </div>

              <button className="button button-dark submit-button" type="submit">
                Complete Registration <span>+</span>
              </button>
              <p className="form-disclaimer">
                Patients in emergency medical need will be able to alert you via WhatsApp or Email.
              </p>
            </form>
          </section>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="toast-message" role="status">
          <span>✓</span>
          <div className="toast-text">{toast}</div>
          <button onClick={() => setToast("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
