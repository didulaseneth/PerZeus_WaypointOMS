import { Link } from "react-router-dom";

/**
 * Minimal placeholder Login page so the app can boot.
 * Replace with your real auth UI later.
 */
const Login = () => {
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
      </div>
    </div>
  );
};

export default Login;
