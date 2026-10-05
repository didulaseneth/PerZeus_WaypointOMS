const headers = { "Content-Type": "application/json" };

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.detail || "Request failed with status " + res.status);
  }
  return data;
};

const get = (url) => fetch(url).then(handleResponse);
const post = (url, body = {}, method = "POST") =>
  fetch(url, {
    method,
    headers,
    body: JSON.stringify(body),
  }).then(handleResponse);

export const api = {
  login: (username, password) => post("/api/login", { username, password }),
  board: (depot = "Peliyagoda") => get(`/api/board?depot=${encodeURIComponent(depot)}`),
  outlets: () => get("/api/outlets"),
  assign: (orderRef, vehicleId, trip) => post("/api/allocations", { orderRef, vehicleId, trip }),
  unassign: (ref) => fetch(`/api/allocations/${encodeURIComponent(ref)}`, { method: "DELETE" }).then(handleResponse),
  autoAllocate: (depot = "Peliyagoda", { rebuild = false, deferRest = false } = {}) =>
    post(`/api/allocations/auto?depot=${encodeURIComponent(depot)}&rebuild=${rebuild}&deferRest=${deferRest}`),
  deferRemaining: (depot = "Peliyagoda") => post(`/api/allocations/defer-rest?depot=${encodeURIComponent(depot)}`),
  validate: (depot = "Peliyagoda") => get(`/api/allocations/validate?depot=${encodeURIComponent(depot)}`),
  exportUrl: "/api/allocations/export",
  resetAllocations: (depot = "Peliyagoda") => post(`/api/allocations/reset?depot=${encodeURIComponent(depot)}`),
  defer: (ref, reason, notes = "", rescheduleDate = "Tomorrow") =>
    post(`/api/orders/${encodeURIComponent(ref)}/defer`, { reason, notes, rescheduleDate }),
  loader: (vehicleId, loaderId) => post(`/api/vehicles/${encodeURIComponent(vehicleId)}/loader`, { loaderId }, "PUT"),
  place: (order) => post("/api/orders", order),
  loaderRuns: (loaderId) => get(`/api/loader/${encodeURIComponent(loaderId)}/runs`),
  load: (ref, loaded) => post(`/api/orders/${encodeURIComponent(ref)}/load`, { loaded }),
  flag: (ref, issue, photo = "", notes = "") =>
    post(`/api/orders/${encodeURIComponent(ref)}/flag`, { issue, photo, notes }),
  depart: (vehicleId) => post(`/api/vehicles/${encodeURIComponent(vehicleId)}/depart`),
  driverRun: (vehicleId) => get(`/api/driver/${encodeURIComponent(vehicleId)}/run`),
  deliver: (ref, status, recipient = "", signature = "", note = "") =>
    post(`/api/orders/${encodeURIComponent(ref)}/delivery`, { status, recipient, signature, note }),
  storeOrders: (outletId) => get(`/api/store/${encodeURIComponent(outletId)}/orders`),
  receipt: (ref, ok, note = "", claimType = "") =>
    post(`/api/orders/${encodeURIComponent(ref)}/receipt`, { ok, note, claimType }),
  fleet: (depot = "Peliyagoda") => get(`/api/fleet?depot=${encodeURIComponent(depot)}`),
  updateVehicleStatus: (id, status, notes = "") => post(`/api/vehicles/${encodeURIComponent(id)}/status`, { status, notes }),
  updateVehicleDriver: (id, driver) => post(`/api/vehicles/${encodeURIComponent(id)}/driver`, { driver }),
  refuelVehicle: (id, amount = 0) => post(`/api/vehicles/${encodeURIComponent(id)}/refuel`, { amount }),
  capacity: (depot = "Peliyagoda") => get(`/api/capacity?depot=${encodeURIComponent(depot)}`),
  fuel: (depot = "Peliyagoda") => get(`/api/fuel?depot=${encodeURIComponent(depot)}`),
  resetSeed: () => post("/api/seed/reset"),
};

// Offline Queue for Driver & Remote roles
const QUEUE_KEY = "wp_offline_queue";
export const getQueue = () => JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
export const queueLen = () => getQueue().length;

export async function send(path, body) {
  try {
    const res = await post(path, body);
    return res;
  } catch (err) {
    if (err instanceof TypeError || !navigator.onLine) {
      const current = getQueue();
      current.push({ id: crypto.randomUUID(), path, body, time: new Date().toISOString() });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(current));
      return { queued: true, message: "Action saved locally in offline queue." };
    }
    throw err;
  }
}

export async function flush() {
  const queue = getQueue();
  if (!queue.length) return 0;
  const remaining = [];
  for (const item of queue) {
    try {
      const res = await fetch(item.path, {
        method: "POST",
        headers,
        body: JSON.stringify(item.body),
      });
      if (res.status >= 500) {
        remaining.push(item);
      }
    } catch {
      remaining.push(item);
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return remaining.length;
}
