import { useState } from "react";
import {
  Phone,
  Lock,
  User,
  Mail,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import Clock from "./Clock";
import { getThemeClasses, getTimeOfDay } from "../../utils/time";

/**
 * Auth flow screens for Driver: Login, Create Account, Forgot Password, OTP.
 * Uses brand colors exclusively. Emojis replaced with Lucide icons.
 */

const AuthShell = ({ title, subtitle, children, showBack, onBack }) => {
  const period = getTimeOfDay();
  const theme = getThemeClasses(period);

  return (
    <div className={`flex flex-col min-h-screen ${theme.pageBg}`}>
      <div className={`${theme.headerBg} px-5 pt-10 pb-8 rounded-b-[2rem] text-center relative`}>
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-4 top-10 p-2 rounded-full bg-white/10 text-whiteCustom"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-purplePrimary flex items-center justify-center">
          <span className="text-whiteCustom text-heading font-bold">W</span>
        </div>
        <h1 className="text-whiteCustom text-subtitle tracking-wide">{title}</h1>
        <p className="text-neutral3 text-secondaryText mt-1">{subtitle}</p>
        <div className="mt-3 flex justify-center">
          <Clock className="text-neutral4" showIcon />
        </div>
      </div>
      <div className="flex-1 px-5 pt-6 pb-8">{children}</div>
    </div>
  );
};

const InputField = ({ label, icon: Icon, type = "text", value, onChange, placeholder }) => {
  const period = getTimeOfDay();
  const theme = getThemeClasses(period);

  return (
    <div className="mb-4">
      <label className={`flex items-center gap-1.5 text-secondaryText ${theme.textSecondary} mb-1.5`}>
        {Icon && <Icon className="w-4 h-4 text-purplePrimary" strokeWidth={2} />}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border ${theme.inputBorder} ${theme.inputBg} ${theme.textPrimary} text-paragraph placeholder:text-gray5 focus:outline-none focus:ring-2 focus:ring-purplePrimary/40 focus:border-purplePrimary`}
      />
    </div>
  );
};

export const LoginScreen = ({ onLogin, onCreateAccount, onForgotPassword }) => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const period = getTimeOfDay();
  const theme = getThemeClasses(period);

  return (
    <AuthShell title="WAYPOINT GROUP" subtitle="Driver Portal">
      <p className={`text-secondaryText ${theme.textMuted} mb-5`}>Sign in to continue</p>
      <InputField
        label="Phone Number"
        icon={Phone}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter your mobile number"
      />
      <InputField
        label="Password"
        icon={Lock}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />
      <button
        type="button"
        onClick={() => onLogin?.({ phone, password })}
        className={`w-full py-3.5 rounded-xl ${theme.accent} font-medium text-paragraph active:scale-[0.98] transition-transform`}
      >
        Login
      </button>
      <div className={`flex items-center gap-3 my-5 ${theme.textMuted}`}>
        <div className={`flex-1 h-px ${theme.border} border-t`} />
        <span className="text-smallText">OR</span>
        <div className={`flex-1 h-px ${theme.border} border-t`} />
      </div>
      <button
        type="button"
        onClick={onCreateAccount}
        className={`w-full py-3.5 rounded-xl border-2 ${theme.accentOutline} font-medium text-paragraph active:scale-[0.98] transition-transform`}
      >
        Create Account
      </button>
      <button
        type="button"
        onClick={onForgotPassword}
        className="w-full mt-4 text-center text-secondaryText text-purplePrimary font-medium"
      >
        Forgot Password?
      </button>
    </AuthShell>
  );
};

export const CreateAccountScreen = ({ onSubmit, onBack }) => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" });
  const period = getTimeOfDay();
  const theme = getThemeClasses(period);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AuthShell title="CREATE ACCOUNT" subtitle="Join Waypoint Group" showBack onBack={onBack}>
      <p className={`text-secondaryText ${theme.textMuted} mb-5`}>Fill in your details</p>
      <InputField label="Full Name" icon={User} value={form.name} onChange={set("name")} placeholder="Enter your full name" />
      <InputField label="Phone Number" icon={Phone} value={form.phone} onChange={set("phone")} placeholder="Enter your mobile number" />
      <InputField label="Email Address" icon={Mail} type="email" value={form.email} onChange={set("email")} placeholder="Enter your email" />
      <InputField label="Password" icon={Lock} type="password" value={form.password} onChange={set("password")} placeholder="Create a password" />
      <button
        type="button"
        onClick={() => onSubmit?.(form)}
        className={`w-full py-3.5 rounded-xl ${theme.accent} font-medium text-paragraph active:scale-[0.98] transition-transform`}
      >
        Create Account
      </button>
    </AuthShell>
  );
};

export const ForgotPasswordScreen = ({ onSubmit, onBack }) => {
  const [phone, setPhone] = useState("");
  const period = getTimeOfDay();
  const theme = getThemeClasses(period);

  return (
    <AuthShell title="Forgot Password" subtitle="We'll send you a reset code" showBack onBack={onBack}>
      <p className={`text-secondaryText ${theme.textMuted} mb-5`}>Enter your registered phone number</p>
      <InputField
        label="Phone Number"
        icon={Phone}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter your mobile number"
      />
      <button
        type="button"
        onClick={() => onSubmit?.(phone)}
        className={`w-full py-3.5 rounded-xl ${theme.accent} font-medium text-paragraph active:scale-[0.98] transition-transform`}
      >
        Send Reset Code
      </button>
      <button
        type="button"
        onClick={onBack}
        className={`w-full mt-4 py-3.5 rounded-xl border-2 ${theme.accentOutline} font-medium text-paragraph`}
      >
        Back to Login
      </button>
    </AuthShell>
  );
};

export const OTPScreen = ({ phoneDisplay = "0771234567", onVerify, onResend, onBack }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const period = getTimeOfDay();
  const theme = getThemeClasses(period);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <AuthShell title="Verify OTP" subtitle="Enter the 4-digit code sent to your phone" showBack onBack={onBack}>
      <div className="flex justify-center mb-2">
        <MessageSquare className="w-10 h-10 text-purplePrimary" strokeWidth={1.5} />
      </div>
      <p className={`text-center text-secondaryText ${theme.textMuted} mb-6`}>
        Code sent to: {phoneDisplay}
      </p>
      <div className="flex justify-center gap-3 mb-6">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-heading rounded-xl border-2 ${theme.inputBorder} ${theme.inputBg} ${theme.textPrimary} focus:outline-none focus:border-purplePrimary focus:ring-2 focus:ring-purplePrimary/30`}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => onVerify?.(otp.join(""))}
        className={`w-full py-3.5 rounded-xl ${theme.accent} font-medium text-paragraph active:scale-[0.98] transition-transform`}
      >
        Verify Code
      </button>
      <p className={`text-center text-secondaryText ${theme.textMuted} mt-4`}>
        Didn&apos;t receive the code?{" "}
        <button type="button" onClick={onResend} className="text-purplePrimary font-medium">
          Resend
        </button>
      </p>
    </AuthShell>
  );
};
