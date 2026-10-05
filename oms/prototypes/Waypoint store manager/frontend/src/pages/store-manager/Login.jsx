import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import logo from "../../assets/waypoint-logo.png";

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState("R. Silva");
  const [password, setPassword] = useState("password");

  const handleLogin = (e) => {
    e.preventDefault();
    login(username);
    navigate("/sm/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-whiteCustom">
      {/* ══════════ LEFT: FORM ══════════ */}
      <div className="w-full lg:w-1/2 flex flex-col p-8">
        {/* Logo — top-left, BIGGER */}
        <div className="flex items-center mb-16">
          <img src={logo} alt="Waypoint Group" className="h-16 w-auto" />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <form onSubmit={handleLogin} className="w-full max-w-sm">
            <h1 className="text-title text-blackCustom text-center mb-2">LOGIN</h1>
            <p className="text-secondaryText text-gray5 text-center mb-8">
              Sign in to manage your store deliveries
            </p>

            <div className="space-y-4 mb-6">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  className="input-field pl-12"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  className="input-field pl-12"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mb-6">
              Login Now
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray3" />
              <span className="text-secondaryText text-gray5">Or continue with</span>
              <div className="flex-1 h-px bg-gray3" />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 border border-gray3 rounded-lg py-3 hover:bg-gray1 transition-colors"
              >
                <span className="text-red-500 font-bold text-lg">G</span>
                <span className="text-secondaryText text-gray6">Login with Google</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 border border-gray3 rounded-lg py-3 hover:bg-gray1 transition-colors"
              >
                <span className="text-blue-600 font-bold text-lg">f</span>
                <span className="text-secondaryText text-gray6">Login with Facebook</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ══════════ RIGHT: ILLUSTRATION ══════════ */}
      <div className="hidden lg:flex w-1/2 bg-purplePrimary relative overflow-hidden items-center justify-center p-12">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-whiteCustom/10" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-whiteCustom/10" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-whiteCustom/5" />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo on top */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="Waypoint Group" className="h-16 w-auto brightness-0 invert" />
          </div>

          {/* Headline */}
          <h2 className="text-whiteCustom text-center mb-3 text-[32px] leading-tight font-bold">
            Welcome back to Waypoint
          </h2>
          <p className="text-whiteCustom/80 text-center text-paragraph mb-10">
            Plan, track, and receive deliveries — all in one place.
          </p>

          {/* Illustration card */}
          <div className="bg-whiteCustom/15 backdrop-blur-sm rounded-3xl p-8 border border-whiteCustom/20">
            <svg viewBox="0 0 400 280" className="w-full h-auto" fill="none">
              <rect x="20" y="230" width="360" height="4" rx="2" fill="white" opacity="0.3" />
              <rect x="90" y="150" width="140" height="70" rx="8" fill="white" opacity="0.95" />
              <rect x="230" y="170" width="70" height="50" rx="8" fill="white" opacity="0.95" />
              <rect x="240" y="180" width="50" height="30" rx="4" fill="#4D4DE9" opacity="0.7" />
              <rect x="105" y="165" width="30" height="20" rx="3" fill="#4D4DE9" opacity="0.3" />
              <rect x="145" y="165" width="30" height="20" rx="3" fill="#4D4DE9" opacity="0.3" />
              <rect x="185" y="165" width="30" height="20" rx="3" fill="#4D4DE9" opacity="0.3" />
              <circle cx="125" cy="225" r="12" fill="#010138" />
              <circle cx="125" cy="225" r="5" fill="white" opacity="0.7" />
              <circle cx="270" cy="225" r="12" fill="#010138" />
              <circle cx="270" cy="225" r="5" fill="white" opacity="0.7" />
              <rect x="100" y="120" width="40" height="30" rx="4" fill="#BDF6CC" />
              <rect x="150" y="125" width="35" height="25" rx="4" fill="#FFDD99" />
              <rect x="195" y="120" width="35" height="30" rx="4" fill="#F9B9D9" />
              <rect x="310" y="140" width="70" height="90" rx="4" fill="white" opacity="0.9" />
              <rect x="320" y="150" width="20" height="20" rx="2" fill="#4D4DE9" opacity="0.5" />
              <rect x="350" y="150" width="20" height="20" rx="2" fill="#4D4DE9" opacity="0.5" />
              <rect x="320" y="180" width="50" height="40" rx="2" fill="#4D4DE9" opacity="0.7" />
              <path d="M305 140 L385 140 L390 155 L300 155 Z" fill="#FFDD99" />
              <path d="M60 185 L85 185" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
              <path d="M50 200 L75 200" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
              <path d="M55 215 L75 215" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
              <path d="M345 90 C345 75 360 75 360 90 C360 100 352 108 352 108 C352 108 345 100 345 90 Z" fill="#F9B9D9" />
              <circle cx="352" cy="90" r="4" fill="white" />
              <circle cx="80" cy="80" r="3" fill="white" opacity="0.5" />
              <circle cx="370" cy="60" r="4" fill="white" opacity="0.4" />
              <circle cx="30" cy="140" r="2" fill="white" opacity="0.6" />
            </svg>
          </div>

          <p className="text-whiteCustom/60 text-center text-small mt-6">
            © 2026 Waypoint Group — Intelligent OMS
          </p>
        </div>
      </div>
    </div>
  );
}