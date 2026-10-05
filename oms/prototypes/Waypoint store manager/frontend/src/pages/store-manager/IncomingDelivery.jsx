import { useState } from "react";
import Layout from "../../components/Layout";
import AlertCard from "../../components/AlertCard";

const steps = [
  { label: "Order confirmed", desc: "Sent to the dispatcher's allocation queue", done: true },
  { label: "Loaded at Pelyagoda depot", desc: "Vehicle VEH001 departed on schedule", done: true },
  { label: "Enroute — 2 stop(s) ahead of you", desc: "Driver K. Bandara", active: true },
  { label: "Arriving at your outlet", desc: "Have receiving staff ready" },
  { label: "Delivered", desc: "Confirm receipt once it arrives" },
];

const orderItems = [
  { name: "Full cream milk 1L", detail: "case of 12", qty: 8, temp: "Chilled" },
  { name: "Low-fat yogurt cups", detail: "tray of 24", qty: 6, temp: "Chilled" },
  { name: "Fresh bread loaves", detail: "each", qty: 40, temp: "Ambient" },
  { name: "Eggs", detail: "tray of 30", qty: 4, temp: "Chilled" },
];

export default function IncomingDelivery() {
  const [ack, setAck] = useState(false);

  return (
    <Layout title="Incoming Delivery">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-title text-blackCustom">Incoming Delivery</h1>
          <p className="text-secondaryText text-gray5 mt-1">
            Track today's delivery for Fresh · Nugegoda so you have staff ready to receive it
          </p>
        </div>

        {!ack && (
          <AlertCard
            variant="warning"
            title="Deferral notice — your Fri, Oct 3 order didn't run"
            message="Fleet capacity was short across the network on Oct 3 — chilled demand exceeded available reefer vehicles ahead of the upcoming festival. It has been rescheduled to Sat, Oct 4 and is included in the delivery tracked below — no action is needed to re-submit it."
            actionLabel="Acknowledge"
            onAction={() => setAck(true)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-paragraph text-blackCustom">Order ORD1042</h2>
              <p className="text-secondaryText text-gray5">Vehicle VEH001 · Driver K. Bandara</p>
            </div>

            <div className="text-center py-6">
              <p className="text-[56px] leading-none font-bold text-purplePrimary mb-3">Arriving now</p>
              <p className="text-secondaryText text-gray5">Expected arrival — 05:30-08:00 window</p>
            </div>

            <div className="mt-8 space-y-6 pl-2">
              {steps.map((s, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i < steps.length - 1 && (
                    <div className={`absolute left-[11px] top-6 w-0.5 h-12 ${s.done ? "bg-green-500" : "bg-gray3"}`} />
                  )}
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
                    s.done ? "bg-green-500" :
                    s.active ? "bg-purplePrimary" : "bg-whiteCustom border-2 border-gray3"
                  }`}>
                    {s.done && <span className="text-whiteCustom text-xs">✓</span>}
                    {s.active && <span className="w-2 h-2 bg-whiteCustom rounded-full" />}
                  </div>
                  <div>
                    <p className={`text-paragraph font-medium ${s.done || s.active ? "text-blackCustom" : "text-gray5"}`}>
                      {s.label}
                    </p>
                    <p className="text-small text-gray5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card h-fit">
            <h2 className="font-bold text-heading text-blackCustom mb-5">What's on this order</h2>
            <div className="space-y-4">
              {orderItems.map((it, i) => (
                <div key={i} className="flex items-center justify-between pb-4 border-b border-gray2 last:border-0">
                  <div>
                    <p className="text-paragraph font-medium text-blackCustom">{it.name}</p>
                    <p className="text-small text-gray5">{it.detail}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-paragraph font-bold text-blackCustom">{it.qty}</span>
                    <span className={`px-2.5 py-1 rounded-full text-small font-medium ${it.temp === "Chilled" ? "bg-neutral2 text-purplePrimary" : "bg-gray2 text-gray6"}`}>
                      {it.temp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}