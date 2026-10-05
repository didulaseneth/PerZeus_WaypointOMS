import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

/**
 * Login / role picker. When arriving from the unified OMS login
 * (?from=unified-login&role=DRIVER), skip straight to the driver workspace.
 */
const Login = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const from = params.get("from");
    const role = (params.get("role") || "").toUpperCase();
    if (from === "unified-login") {
      // Persist identity for the session
      try {
        localStorage.setItem(
          "waypoint_auth",
          JSON.stringify({
            id: params.get("user"),
            name: params.get("name"),
            role: params.get("role"),
          })
        );
      } catch (_) {}
      if (role === "DRIVER") navigate("/driver", { replace: true });
      else if (role === "LOADER") navigate("/loader", { replace: true });
      else if (role === "STORE_MANAGER") navigate("/store-manager", { replace: true });
      else if (role === "DISPATCHER") navigate("/dispatcher", { replace: true });
    }
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-gray1 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm bg-whiteCustom rounded-2xl shadow-sm border border-gray3 p-6 text-center">
        <h1 className="text-subtitle text-blackCustom mb-2">Waypoint OMS</h1>
        <p className="text-secondaryText text-gray5 mb-6">Select a role to continue</p>
        <div className="space-y-3">
          <Link
            to="/driver"
            className="block w-full py-3 rounded-xl bg-purplePrimary text-whiteCustom font-medium"
          >
            Driver Portal
          </Link>
          <Link
            to="/dispatcher"
            className="block w-full py-3 rounded-xl border-2 border-purplePrimary text-purplePrimary font-medium"
          >
            Dispatcher
          </Link>
          <Link
            to="/store-manager"
            className="block w-full py-3 rounded-xl border-2 border-gray3 text-gray6 font-medium"
          >
            Store Manager
          </Link>
          <Link
            to="/loader"
            className="block w-full py-3 rounded-xl border-2 border-gray3 text-gray6 font-medium"
          >
            Loader
          </Link>
        </div>
        <p className="mt-6 text-xs text-gray5">
          Prefer the unified login?{" "}
          <a href="http://localhost:5173/login" className="text-purplePrimary underline">
            Open portal
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
