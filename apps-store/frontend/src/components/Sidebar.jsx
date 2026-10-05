import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import logo from "../assets/waypoint-logo.png";

const navItems = [
  { to: "/sm/dashboard", label: "Dashboard", icon: "M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a3 3 0 110 6 3 3 0 010-6z" },
  { to: "/sm/place-order", label: "Place Order", badge: 12, icon: "M12 4v16m8-8H4" },
  { to: "/sm/orders", label: "My Orders", icon: "M4 6h16M4 12h16M4 18h16" },
  { to: "/sm/incoming", label: "Incoming Delivery", icon: "M3 7h13v10H3zM16 10h3l2 3v4h-5z" },
  { to: "/sm/receiving", label: "Receiving", icon: "M5 13l4 4L19 7" },
  { to: "/sm/reports", label: "Reports", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
];

export default function Sidebar() {
  const { logout } = useApp();

  return (
    <aside className="w-64 bg-whiteCustom border-r border-gray2 flex flex-col justify-between min-h-screen">
      <div>
        {/* Waypoint logo — BIGGER */}
        <div className="px-6 py-5 flex items-center">
          <div className="bg-blackCustom rounded-xl px-4 py-3">
            <img src={logo} alt="Waypoint Group" className="h-10 w-auto" />
          </div>
        </div>

        <p className="px-6 pt-4 pb-2 text-small text-gray5 uppercase tracking-wide">
          Operations
        </p>

        <nav className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-paragraph transition-colors ${
                  isActive
                    ? "bg-neutral1 text-purplePrimary font-medium"
                    : "text-gray6 hover:bg-gray1"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </span>
              {item.badge && (
                <span className="text-small bg-neutral1 text-purplePrimary px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mx-3 mt-6 bg-gray1 rounded-xl p-4 space-y-1">
          <div className="flex justify-between text-small">
            <span className="font-bold text-blackCustom">6</span>
            <span className="text-gray5">Orders placed this week</span>
          </div>
          <div className="flex justify-between text-small">
            <span className="font-bold text-blackCustom">1</span>
            <span className="text-gray5">Deferred this week</span>
          </div>
          <div className="flex justify-between text-small">
            <span className="font-bold text-blackCustom">92%</span>
            <span className="text-gray5">On-time rate</span>
          </div>
        </div>
      </div>

      <button
        onClick={logout}
        className="m-3 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-secondaryPink text-pink-900 font-medium hover:opacity-90"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
          />
        </svg>
        Logout
      </button>
    </aside>
  );
}