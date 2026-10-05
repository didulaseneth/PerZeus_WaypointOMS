import { useState } from "react";
import { useApp } from "../../context/AppContext";
import Layout from "../../components/Layout";
import OrderStatusBadge from "../../components/OrderStatusBadge";

const statuses = ["All Status", "Placed", "Confirmed", "Deferred", "Delivery", "Issue reported"];

export default function MyOrders() {
  const { orders } = useApp();
  const [filter, setFilter] = useState("All Status");
  const [open, setOpen] = useState(false);

  const filtered = filter === "All Status" ? orders : orders.filter((o) => o.status === filter);

  return (
    <Layout title="My Orders">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-title text-blackCustom">My Orders</h1>
            <p className="text-secondaryText text-gray5 mt-1">
              Every order you've placed for Fresh · Nugegoda, with its current status
            </p>
          </div>

          <div className="relative">
            <button onClick={() => setOpen(!open)} className="btn-secondary flex items-center gap-2">
              {filter} ▾
            </button>
            {open && (
              <div className="absolute right-0 mt-2 bg-whiteCustom border border-gray2 rounded-lg shadow-lg py-2 w-52 z-10">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilter(s); setOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-paragraph hover:bg-gray1 ${filter === s ? "text-purplePrimary font-medium" : "text-gray6"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-paragraph text-blackCustom">Order history</h2>
            <span className="text-small text-gray5">{filtered.length} orders</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-small text-gray5 uppercase border-b border-gray2">
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Placed on</th>
                  <th className="pb-3 font-medium">For delivery</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Expected arrival</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-gray2 last:border-0 hover:bg-gray1">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {(o.status === "Deferred" || o.status === "Issue reported") && (
                          <span className="w-1 h-8 rounded-full bg-secondaryPink" />
                        )}
                        <span className="font-medium text-paragraph text-blackCustom">{o.id}</span>
                      </div>
                    </td>
                    <td className="py-4 text-paragraph text-gray6">{o.placedOn}</td>
                    <td className="py-4 text-paragraph text-gray6">{o.forDelivery}</td>
                    <td className="py-4 text-paragraph text-gray6">{o.items} items</td>
                    <td className="py-4 text-paragraph text-gray6">{o.expectedArrival}</td>
                    <td className="py-4"><OrderStatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}