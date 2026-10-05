import { createContext, useContext, useState } from "react";

const AppContext = createContext();

const seedOrders = [
  { id: "ORD1042", placedOn: "Oct 3, 3:12 PM", forDelivery: "Sat, Oct 4", items: 4, expectedArrival: "07:10", status: "Confirmed", chilled: 3 },
  { id: "ORD1038", placedOn: "Oct 2, 2:40 PM", forDelivery: "Fri, Oct 3", items: 5, expectedArrival: "—", status: "Deferred", chilled: 2 },
  { id: "ORD1031", placedOn: "Oct 1, 1:55 PM", forDelivery: "Thu, Oct 2", items: 4, expectedArrival: "07:05", status: "Delivered", chilled: 2 },
  { id: "ORD1024", placedOn: "Sep 30, 3:30 PM", forDelivery: "Wed, Oct 1", items: 6, expectedArrival: "06:58", status: "Delivered", chilled: 1 },
  { id: "ORD1019", placedOn: "Sep 29, 2:10 PM", forDelivery: "Tue, Sep 30", items: 5, expectedArrival: "07:20", status: "Issue reported", chilled: 3 },
  { id: "ORD1011", placedOn: "Sep 28, 3:50 PM", forDelivery: "Mon, Sep 29", items: 4, expectedArrival: "07:00", status: "Delivered", chilled: 2 },
];

const orderCatalog = [
  { name: "Full cream milk 1L (case of 12)", temp: "Chilled" },
  { name: "Low-fat yogurt cups (tray of 24)", temp: "Chilled" },
  { name: "Fresh bread loaves (each)", temp: "Ambient" },
  { name: "Chicken breast (kg)", temp: "Chilled" },
  { name: "Bananas (kg)", temp: "Ambient" },
  { name: "Frozen peas (bag)", temp: "Chilled" },
  { name: "Eggs (tray of 30)", temp: "Chilled" },
  { name: "Bottled water 500ml (case of 24)", temp: "Ambient" },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState(seedOrders);
  const [store] = useState({ name: "Fresh - Nugegoda", brand: "Fresh", district: "Colombo" });

  const login = (username) => setUser({ name: username || "R. Silva", role: "Store Manager" });
  const logout = () => setUser(null);

  const placeOrder = (items) => {
    const newOrder = {
      id: `ORD${1043 + orders.length}`,
      placedOn: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }),
      forDelivery: "Sat, Oct 4",
      items: items.length,
      expectedArrival: "—",
      status: "Placed",
      chilled: items.filter((i) => i.temp === "Chilled").length,
    };
    setOrders([newOrder, ...orders]);
    return newOrder;
  };

  return (
    <AppContext.Provider value={{ user, login, logout, orders, placeOrder, store, orderCatalog }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);