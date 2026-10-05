import Layout from "../../components/Layout";

const deferrals = [
  { outlet: "Fresh - Wattala", order: "ORD0998", reason: "", deferredBy: "S. Perera", date: "Oct 2", history: "Skipped 2 runs in a row", danger: true },
  { outlet: "Fresh - Minuwangoda", order: "ORD1002", reason: "", deferredBy: "S. Perera", date: "Oct 2", history: "1st deferral" },
  { outlet: "Tech - Kandy", order: "ORD1015", reason: "", deferredBy: "N. Fernando", date: "Oct 2", history: "1st deferral" },
];

const weeks = [
  { w: "Wk40", rate: 55, orders: 6 },
  { w: "Wk41", rate: 45, orders: 5 },
  { w: "Wk42", rate: 78, orders: 4 },
  { w: "Wk43", rate: 38, orders: 6 },
  { w: "Wk44", rate: 72, orders: 3 },
  { w: "Wk45", rate: 22, orders: 2 },
  { w: "Wk46", rate: 60, orders: 5 },
  { w: "Wk47", rate: 40, orders: 4 },
  { w: "Wk48", rate: 66, orders: 5 },
];

export default function Reports() {
  return (
    <Layout title="Reports">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-title text-blackCustom">Report</h1>
            <p className="text-secondaryText text-gray5 mt-1">
              Every deferred order, with the reason on record — so an outlet is never silently skipped twice without anyone noticing.
            </p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-secondaryPink text-pink-900 text-small font-medium">
            1 outlet skipped twice in a row
          </span>
        </div>

        <div className="card">
          <h2 className="font-bold text-heading text-purplePrimary mb-5">Open deferrals</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-small text-gray5 uppercase border-b border-gray2">
                  <th className="pb-3 font-medium">Outlet</th>
                  <th className="pb-3 font-medium">Order</th>
                  <th className="pb-3 font-medium">Reason</th>
                  <th className="pb-3 font-medium">Deferred by</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">History</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {deferrals.map((d, i) => (
                  <tr key={i} className="border-b border-gray2 last:border-0">
                    <td className="py-4 text-paragraph font-medium text-blackCustom">{d.outlet}</td>
                    <td className="py-4 text-paragraph text-gray6">{d.order}</td>
                    <td className="py-4">
                      <select className="border border-gray3 rounded-lg px-3 py-1.5 text-secondaryText text-gray6">
                        <option>Reason ▾</option>
                        <option>Capacity</option>
                        <option>Window missed</option>
                        <option>Vehicle unavailable</option>
                      </select>
                    </td>
                    <td className="py-4 text-paragraph text-gray6">{d.deferredBy}</td>
                    <td className="py-4 text-paragraph text-gray6">{d.date}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-small font-medium ${
                        d.danger ? "bg-secondaryPink text-pink-900" : "bg-gray2 text-gray6"
                      }`}>
                        {d.history}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="btn-primary text-small py-1.5 px-3">Reschedule to next run</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-heading text-purplePrimary mb-6">On-time delivery rate</h2>

          <div className="relative h-64 flex items-end gap-4 px-2">
            <div className="absolute top-2 left-0 right-0 border-t-2 border-dashed border-red-500">
              <span className="absolute right-0 -top-6 text-small text-gray6 font-bold">MAX</span>
            </div>
            {weeks.map((w) => (
              <div key={w.w} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gray3 rounded-t-lg" style={{ height: `${w.rate * 2.2}px` }} />
                <span className="text-small text-gray5">{w.w}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-6 mt-6 text-small text-gray6">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purplePrimary" /> On-time rate(%)</span>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Orders Placed</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}