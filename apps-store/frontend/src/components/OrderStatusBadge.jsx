const styles = {
  Confirmed: "bg-secondaryGreen text-green-800",
  Placed: "bg-neutral1 text-purplePrimary",
  Delivered: "bg-secondaryGreen text-green-800",
  Deferred: "bg-secondaryPink text-pink-900",
  "Issue reported": "bg-secondaryYellow text-yellow-900",
};

export default function OrderStatusBadge({ status }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-small font-medium ${styles[status] || "bg-gray2 text-gray6"}`}>
      {status}
    </span>
  );
}