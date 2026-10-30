import React, { useState, useEffect, useMemo } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marketplace from "./components/Marketplace";
import ItemDetailModal from "./components/ItemDetailModal";
import RequestBorrowModal from "./components/RequestBorrowModal";
import AddItemModal from "./components/AddItemModal";
import HandoverModal from "./components/HandoverModal";
import NeedItNow from "./components/NeedItNow";
import BloodNetwork from "./components/BloodNetwork";
import LostFound from "./components/LostFound";
import MyBorrows from "./components/MyBorrows";
import PaidRentals from "./components/PaidRentals";
import AuthModal from "./components/AuthModal";
import NotificationsDrawer from "./components/NotificationsDrawer";
import Footer from "./components/Footer";
import {
  getItems,
  getDonors,
  getUrgentNeeds,
  getLostFound,
  getOwnerIncomingRequests,
  getNotifications,
  STARTER_ITEMS,
  STARTER_DONORS,
  STARTER_URGENT_NEEDS,
  STARTER_LOST_FOUND,
} from "./services/api";
import { supabase } from "./supabase";
import "./App.css";

// Default coordinates: Belagavi City Center (Channamma Circle)
const DEFAULT_COORDS = {
  lat: 15.8528,
  lng: 74.5045,
  area: "Belagavi Central",
};

// Precise distance calculation (Haversine formula in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function MainApp() {
  const { user, profile } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState("marketplace");

  // Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [maxDistance, setMaxDistance] = useState("all");

  // Geolocation
  const [userCoords, setUserCoords] = useState(DEFAULT_COORDS);

  // Data states with instant SWR initial state (0ms load time)
  const [items, setItems] = useState(() => {
    try {
      const c = localStorage.getItem("lifelink_cached_items");
      if (c) {
        const parsed = JSON.parse(c);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return STARTER_ITEMS;
  });
  const [donors, setDonors] = useState(() => {
    try {
      const c = localStorage.getItem("lifelink_cached_donors");
      if (c) {
        const parsed = JSON.parse(c);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return STARTER_DONORS;
  });
  const [urgentNeeds, setUrgentNeeds] = useState(() => {
    try {
      const c = localStorage.getItem("lifelink_cached_urgent_needs");
      if (c) {
        const parsed = JSON.parse(c);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return STARTER_URGENT_NEEDS;
  });
  const [lostFound, setLostFound] = useState(() => {
    try {
      const c = localStorage.getItem("lifelink_cached_lost_found");
      if (c) {
        const parsed = JSON.parse(c);
        if (parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return STARTER_LOST_FOUND;
  });

  // Modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestModalItem, setRequestModalItem] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [addItemInitialType, setAddItemInitialType] = useState("Borrow");
  const [handoverRequest, setHandoverRequest] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  function handleOpenAddItem(initialType = "Borrow") {
    setAddItemInitialType(initialType);
    setShowAddItem(true);
  }

  // Toast
  const [toastMessage, setToastMessage] = useState(null);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Check unread incoming requests and notifications
  async function checkUnreadCount() {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }
    try {
      const [inc, notifs] = await Promise.all([
        getOwnerIncomingRequests(user.id, profile?.full_name),
        getNotifications(user.id),
      ]);
      const pendingInc = (inc || []).filter((r) => r.status === "pending").length;
      const unreadNotifs = (notifs || []).filter((n) => !n.is_read).length;
      setUnreadCount(pendingInc + unreadNotifs);
    } catch (e) {
      console.warn("Unread count note:", e);
    }
  }

  // Detect GPS Location gracefully and accurately
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            area: "Current GPS Location",
          });
        },
        () => {
          // Use default Belagavi coordinates without nagging
        },
        { timeout: 8000, maximumAge: 60000, enableHighAccuracy: true }
      );
    }
  }, []);

  // Fetch all initial data from Supabase
  async function loadAllData() {
    try {
      const [itms, dnrs, urg, lf] = await Promise.all([
        getItems(),
        getDonors(),
        getUrgentNeeds(),
        getLostFound(),
      ]);

      setItems(itms || []);
      setDonors(dnrs || []);
      setUrgentNeeds(urg || []);
      setLostFound(lf || []);
    } catch (err) {
      console.warn("Data loading note:", err.message);
    }
  }

  // Reactive distance calculation: dynamically updates whenever items OR userCoords change!
  const itemsWithDistance = useMemo(() => {
    return items.map((item) => {
      const itemLat = Number(item.lat) || 15.8528;
      const itemLng = Number(item.lng) || 74.5045;
      const dist = calculateDistance(userCoords.lat, userCoords.lng, itemLat, itemLng);
      return {
        ...item,
        distance: dist !== null ? dist : 0.8,
      };
    });
  }, [items, userCoords]);

  const selectedItemWithDist = useMemo(() => {
    if (!selectedItem) return null;
    return itemsWithDistance.find((it) => it.id === selectedItem.id) || selectedItem;
  }, [selectedItem, itemsWithDistance]);

  useEffect(() => {
    loadAllData();

    // Supabase Real-time Subscriptions
    const itemsChannel = supabase
      .channel("realtime-items")
      .on("postgres_changes", { event: "*", schema: "public", table: "items" }, () => {
        loadAllData();
      })
      .subscribe();

    const donorsChannel = supabase
      .channel("realtime-donors")
      .on("postgres_changes", { event: "*", schema: "public", table: "donors" }, () => {
        loadAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(itemsChannel);
      supabase.removeChannel(donorsChannel);
    };
  }, []);

  // Real-time Notification & Request Subscriptions for logged-in user
  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    checkUnreadCount();

    const userChannel = supabase
      .channel(`user-sync-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "requests" },
        (payload) => {
          if (payload.new?.owner_id === user.id) {
            showToast(`🔔 New borrow request received for your item!`);
            checkUnreadCount();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          if (payload.new?.user_id === user.id) {
            showToast(`🔔 ${payload.new.title}: ${payload.new.message}`);
            checkUnreadCount();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "requests" },
        () => {
          checkUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
    };
  }, [user?.id, profile?.full_name]);

  const distanceLabel = (dist) => {
    if (dist === null || dist === undefined) return "Nearby";
    if (dist < 1) return `${Math.round(dist * 1000)} m away`;
    if (dist >= 50) return `${Math.round(dist)} km away`;
    return `${Number(dist).toFixed(1)} km away`;
  };

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenNotifications={() => {
          setShowNotifications(true);
          setUnreadCount(0);
        }}
        unreadCount={unreadCount}
        onOpenAddItem={() => handleOpenAddItem("Borrow")}
        userLocation={userCoords}
      />

      <main>
        {/* Hero Section */}
        <Hero
          onOpenAddItem={() => handleOpenAddItem("Borrow")}
          itemsCount={items.length}
          donorsCount={donors.length}
        />

        {/* Main Tab Content */}
        {activeTab === "marketplace" && (
          <Marketplace
            items={itemsWithDistance}
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={setCategory}
            maxDistance={maxDistance}
            setMaxDistance={setMaxDistance}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenAddItem={() => handleOpenAddItem("Borrow")}
            distanceLabel={distanceLabel}
            userLocation={userCoords}
          />
        )}

        {activeTab === "rentals" && (
          <PaidRentals
            items={itemsWithDistance}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenAddItem={(type) => handleOpenAddItem(type || "Rent")}
            distanceLabel={distanceLabel}
            userLocation={userCoords}
          />
        )}

        {activeTab === "urgent" && (
          <NeedItNow
            needs={urgentNeeds}
            onRefresh={loadAllData}
            onNotifyToast={showToast}
          />
        )}

        {activeTab === "blood" && (
          <BloodNetwork
            donors={donors}
            onRefresh={loadAllData}
            onNotifyToast={showToast}
          />
        )}

        {activeTab === "lostfound" && (
          <LostFound
            items={lostFound}
            onRefresh={loadAllData}
            onNotifyToast={showToast}
          />
        )}

        {activeTab === "myborrows" && (
          <MyBorrows
            onOpenHandover={(req) => setHandoverRequest(req)}
            onNotifyToast={showToast}
            onBrowseMarketplace={() => setActiveTab("marketplace")}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        )}
      </main>

      {/* Modals & Slide-out Drawers */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItemWithDist}
          onClose={() => setSelectedItem(null)}
          onRequest={(item) => {
            setSelectedItem(null);
            setRequestModalItem(item);
          }}
          distanceLabel={distanceLabel}
          onOpenHandover={(item) => {
            setSelectedItem(null);
            setHandoverRequest(item);
          }}
        />
      )}

      {requestModalItem && (
        <RequestBorrowModal
          item={requestModalItem}
          onClose={() => setRequestModalItem(null)}
          onSuccess={() => {
            showToast(`Borrow request sent to ${requestModalItem.owner}!`);
            loadAllData();
          }}
        />
      )}

      {showAddItem && (
        <AddItemModal
          userCoords={userCoords}
          initialType={addItemInitialType}
          onClose={() => setShowAddItem(false)}
          onSuccess={() => {
            loadAllData();
          }}
          onNotifyToast={showToast}
        />
      )}

      {handoverRequest && (
        <HandoverModal
          request={handoverRequest}
          onClose={() => setHandoverRequest(null)}
          onSuccess={() => {
            showToast("Item handover status updated successfully!");
            loadAllData();
          }}
        />
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            showToast("Signed in successfully!");
            loadAllData();
          }}
        />
      )}

      <NotificationsDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onOpenHandover={(req) => setHandoverRequest(req)}
      />

      {/* Global Toast Message */}
      {toastMessage && (
        <div className="toast-message" role="alert">
          <span className="toast-icon">✨</span>
          <span className="toast-text">{toastMessage}</span>
          <button
            className="toast-dismiss"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss toast"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Footer */}
      <Footer onSwitchTab={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 500, behavior: "smooth" });
      }} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
