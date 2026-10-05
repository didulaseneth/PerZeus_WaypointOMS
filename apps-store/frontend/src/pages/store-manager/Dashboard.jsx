import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Layout from "../../components/Layout";
import AlertCard from "../../components/AlertCard";

const stats = [
  {
    icon: "📦",
    value: 6,
    label: "Orders this week",
    note: "Across all brands for this outlet",
    noteColor: "text-purplePrimary",
  },
  {
    icon: "⚠️",
    value: 1,
    label: "Deferred recently",
    note: "Rescheduled to a later run",
    noteColor: "text-pink-600",
  },
  {
    icon: "📋",
    value: 1,
    label: "Issues reported",
    note: "Discrepancies on receipt",
    noteColor: "text-yellow-700",
  },
  {
    icon: "📍",
    value: "92%",
    label: "Delivered on time",
    note: "3 deliveries this week",
    noteColor: "text-green-700",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, store } = useApp();

  return (
    <Layout title="Dashboard">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-title text-blackCustom">Good morning {user?.name}</h1>
            <p className="text-secondaryText text-gray5 mt-1">
              {store.name} · {store.district}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-secondaryGreen text-green-800 text-small font-medium">
              Auto-refresh 15s
            </span>
            <button className="btn-ghost flex items-center gap-2">⬇ Export</button>
          </div>
        </div>

        {/* Deferral alert */}
        <AlertCard
          variant="warning"
          title="Your Fri, Oct 3 order was deferred to Sat, Oct 4"
          message="Fleet capacity was short across the network on Oct 3 — chilled demand exceeded available reefer vehicles ahead of the upcoming festival."
          actionLabel="View details"
          onAction={() => navigate("/sm/orders")}
        />

        {/* Next delivery */}
        <div className="card bg-neutral1 flex items-center justify-between">
          <div>
            <p className="text-small text-gray5 uppercase tracking-wide mb-2">
              Next Delivery · Today
            </p>
            <h2 className="text-subtitle text-blackCustom mb-1">Order ORD1042 · 4 items</h2>
            <p className="text-secondaryText text-gray6">
              Driver K. Bandara · VEH001 · 2 stops ahead of you
            </p>
          </div>
          <div className="text-right">
            <p className="text-title text-blackCustom">07:10</p>
            <p className="text-small text-gray5 mb-3">Expected arrival</p>
            <button
              onClick={() => navigate("/sm/incoming")}
              className="btn-primary"
            >
              Track delivery
            </button>
          </div>
        </div>

        {/* Quick Action */}
        <div>
          <h2 className="text-heading text-blackCustom mb-4">Quick Action</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "Place tomorrow order",
                desc: "Cutoff is at 4:00 pm - build your list before then",
                to: "/sm/place-order",
              },
              {
                title: "Confirm today receipt",
                desc: "Check off items as they arrive and flag any issue",
                to: "/sm/receiving",
              },
              {
                title: "Review your order history",
                desc: "See every order you've placed and its current status",
                to: "/sm/orders",
              },
            ].map((a) => (
              <button
                key={a.title}
                onClick={() => navigate(a.to)}
                className="card text-left hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-paragraph text-blackCustom mb-1">
                  {a.title}
                </h3>
                <p className="text-small text-gray5">{a.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ⬇️ NEW: 4 Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-neutral1 flex items-center justify-center text-heading">
                  {s.icon}
                </div>
                <span className="text-subtitle font-bold text-blackCustom">
                  {s.value}
                </span>
              </div>
              <p className="text-paragraph font-medium text-blackCustom mb-1">
                {s.label}
              </p>
              <p className={`text-small ${s.noteColor}`}>{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}