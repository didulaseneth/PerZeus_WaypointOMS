import { useState } from "react";
import Layout from "../../components/Layout";

const initialItems = [
  { name: "Full cream milk 1L", detail: "Expected 8 - case of 12", qty: 8, temp: "Chilled", result: null },
  { name: "Low-fat yogurt cups", detail: "Expected 6 - tray of 24", qty: 6, temp: "Chilled", result: null },
  { name: "Fresh bread loaves", detail: "Expected 40 - each", qty: 40, temp: "Ambient", result: null },
  { name: "Eggs", detail: "Expected 4 - tray of 30", qty: 4, temp: "Chilled", result: null },
  { name: "Full cream milk 1L", detail: "Expected 8 - case of 12", qty: 8, temp: "Chilled", result: null },
];

export default function Receiving() {
  const [items, setItems] = useState(initialItems);
  const [confirmed, setConfirmed] = useState(false);

  const setResult = (i, result) => {
    const next = [...items];
    next[i].result = result;
    setItems(next);
  };

  const checked = items.filter((i) => i.result === "Received").length;

  return (
    <Layout title="Receiving">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-title text-blackCustom">Receiving · Order ORD1042</h1>
            <p className="text-secondaryText text-gray5 mt-1">
              Check off each item as it's unloaded. Mark anything short or damaged so it's on record before the driver leaves.
            </p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-secondaryYellow text-yellow-900 text-small font-medium">
            Awaiting your verification
          </span>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-paragraph text-blackCustom">Driver's report</h2>
            <span className="text-small text-gray5">Filed at 07:16 AM</span>
          </div>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div><p className="text-small text-gray5">Driver</p><p className="text-paragraph font-medium text-blackCustom">K. Bandara</p></div>
            <div><p className="text-small text-gray5">Vehicle</p><p className="text-paragraph font-medium text-blackCustom">VEH001</p></div>
            <div><p className="text-small text-gray5">Items dispatched</p><p className="text-paragraph font-medium text-blackCustom">4 line items</p></div>
            <div><p className="text-small text-gray5">Submitted at</p><p className="text-paragraph font-medium text-blackCustom">07:16 AM</p></div>
          </div>
          <div className="bg-gray1 rounded-lg p-4 italic text-secondaryText text-gray6">
            "All chilled items were on ice packs at drop-off. One crate shifted in transit — flagged it before unloading in case anything's bruised underneath."
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 rounded-lg bg-gray1 text-secondaryText text-gray6">📷 Photo 1</button>
            <button className="px-4 py-2 rounded-lg bg-gray1 text-secondaryText text-gray6">📷 Photo 2</button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-heading text-blackCustom">Expected items</h2>
            <span className="text-secondaryText text-gray5">{checked}/{items.length} checked</span>
          </div>

          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray2 last:border-0">
                <div>
                  <p className="text-paragraph font-medium text-blackCustom">{it.name}</p>
                  <p className="text-small text-gray5">
                    {it.detail} · {it.temp === "Chilled" ? "❄ chilled" : "ambient"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {["Received", "Short", "Damaged"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setResult(i, r)}
                      className={`px-4 py-1.5 rounded-full text-small font-medium border transition-colors ${
                        it.result === r
                          ? r === "Received"
                            ? "bg-secondaryGreen border-secondaryGreen text-green-900"
                            : "bg-secondaryPink border-secondaryPink text-pink-900"
                          : "border-gray3 text-gray6 hover:bg-gray1"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setConfirmed(true)}
              disabled={confirmed}
              className="btn-primary flex items-center gap-2"
            >
              ✓ Confirm receipt
            </button>
          </div>
          {confirmed && (
            <p className="text-center text-secondaryText text-green-700 mt-3">
              Receipt confirmed. The dispatcher and driver have been notified.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}