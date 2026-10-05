import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import Layout from "../../components/Layout";
import Modal from "../../components/Modal";

export default function PlaceOrder() {
  const { orderCatalog, placeOrder } = useApp();
  const navigate = useNavigate();
  const [items, setItems] = useState([{ ...orderCatalog[0], qty: 1 }]);
  const [showSuccess, setShowSuccess] = useState(false);

  const addItem = () => setItems([...items, { ...orderCatalog[0], qty: 1 }]);

  const updateItem = (i, field, value) => {
    const next = [...items];
    next[i][field] = value;
    setItems(next);
  };

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const handleConfirm = () => {
    placeOrder(items);
    setShowSuccess(true);
  };

  const chilledCount = items.filter((i) => i.temp === "Chilled").length;

  return (
    <Layout title="Place Order">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-title text-blackCustom">Place Order</h1>
            <p className="text-secondaryText text-gray5 mt-1 max-w-xl">
              Build tomorrow's order for Fresh · Nugegoda. Orders must be confirmed before the 4.00 PM cutoff to be planned onto tomorrow's run
            </p>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-neutral1 text-purplePrimary text-secondaryText font-medium">
            Cutoff in 3:59:54
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-paragraph text-blackCustom">Order Item</h2>
              <span className="text-small text-gray5">{items.length} line items</span>
            </div>

            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <select
                    value={item.name}
                    onChange={(e) => {
                      const picked = orderCatalog.find((c) => c.name === e.target.value);
                      updateItem(i, "name", picked.name);
                      updateItem(i, "temp", picked.temp);
                    }}
                    className="flex-1 input-field"
                  >
                    {orderCatalog.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>

                  {/* ⬇️ NEW: Quantity input */}
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(i, "qty", Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 input-field text-center"
                  />

                  <span
                    className={`px-3 py-1.5 rounded-full text-small font-medium ${
                      item.temp === "Chilled"
                        ? "bg-neutral2 text-purplePrimary"
                        : "bg-gray2 text-gray6"
                    }`}
                  >
                    {item.temp}
                  </span>

                  <button
                    onClick={() => removeItem(i)}
                    className="w-9 h-9 rounded-lg bg-secondaryPink text-pink-900 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button onClick={addItem} className="btn-secondary mt-4">+ Add items</button>
          </div>

          <div className="card h-fit">
            <h2 className="font-bold text-paragraph text-blackCustom mb-4">Order summary</h2>

            <div className="space-y-4 pb-5 border-b border-gray2">
              <div>
                <p className="text-secondaryText text-gray5 mb-1">Delivery window</p>
                <p className="text-paragraph font-medium text-blackCustom">5:30 - 8:00, before store opening</p>
              </div>
              <div>
                <p className="text-secondaryText text-gray5 mb-1">Item with chilled requirement</p>
                <p className="text-paragraph font-medium text-blackCustom">{chilledCount}</p>
              </div>
              <div>
                <p className="text-secondaryText text-gray5 mb-1">Total line items</p>
                <p className="text-paragraph font-medium text-blackCustom">{items.length}</p>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={!items.length}
              className="btn-primary w-full mt-5"
            >
              Confirm order
            </button>
            <p className="text-small text-gray5 text-center mt-3">
              You'll get a confirmation once the dispatcher's system receives it
            </p>
          </div>
        </div>
      </div>

      <Modal
        open={showSuccess}
        variant="confirm"
        title="Order confirmed"
        message={`${items.length} item${items.length > 1 ? "s" : ""} sent for the next available delivery to Fresh · Nugegoda. You'll see an expected arrival time on the Incoming Delivery Screen once the dispatch plans the route.`}
        onClose={() => {
          setShowSuccess(false);
          navigate("/sm/orders");
        }}
      />
    </Layout>
  );
}