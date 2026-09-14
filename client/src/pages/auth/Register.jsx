import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { register as apiRegister, verifyRegistration } from '../../api/auth.js';
import useAuth from '../../hooks/useAuth.js';
import Brand from '../../components/shared/Brand.jsx';

const RESEND_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 8;
const inputClass = 'w-full border border-line-strong rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';
const primaryButtonClass = 'w-full bg-brand-500 text-brand-950 rounded-lg py-2 text-sm font-medium hover:bg-brand-400 disabled:opacity-50 transition-colors';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('details'); // 'details', then 'code' once the email is sent
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function sendCode() {
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      await apiRegister(form);
      setStep('code');
      setCode('');
      setResendIn(RESEND_SECONDS);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDetailsSubmit(e) {
    e.preventDefault();
    await sendCode();
  }

  async function handleResend() {
    if (await sendCode()) setNotice('We sent you a new code.');
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      const { token } = await verifyRegistration({ email: form.email, code });
      login(token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function backToDetails() {
    setStep('details');
    setError('');
    setNotice('');
  }

  const messages = (
    <>
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400">
          {error}
        </motion.p>
      )}
      {notice && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-brand-400">
          {notice}
        </motion.p>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm bg-surface rounded-2xl shadow-sm border border-line p-8"
      >
        <div className="mb-6">
          <Brand />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {step === 'details' ? (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-semibold text-fg mb-6">Create account</h1>

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-fg-muted mb-1">
                    Name
                  </label>
                  <input id="name" type="text" name="name" required autoComplete="name" value={form.name} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-fg-muted mb-1">
                    Email
                  </label>
                  <input id="email" type="email" name="email" required autoComplete="email" value={form.email} onChange={handleChange} className={inputClass} />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-fg-muted mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-fg-subtle">At least {MIN_PASSWORD_LENGTH} characters.</p>
                </div>

                {messages}

                <button type="submit" disabled={submitting} className={primaryButtonClass}>
                  {submitting ? 'Sending code…' : 'Continue'}
                </button>
              </form>

              <p className="mt-4 text-sm text-fg-muted text-center">
                Already have an account?{' '}
                <Link to="/login" className="text-brand-400 hover:underline">
                  Sign in
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-semibold text-fg mb-2">Check your email</h1>
              <p className="text-sm text-fg-muted mb-6">
                We sent a 6-digit code to <span className="text-fg">{form.email}</span>. It expires in 10 minutes.
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-fg-muted mb-1">
                    Verification code
                  </label>
                  <input
                    id="code"
                    name="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    autoFocus
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className={`${inputClass} text-center text-lg tracking-[0.5em]`}
                  />
                </div>

                {messages}

                <button type="submit" disabled={submitting || code.length !== 6} className={primaryButtonClass}>
                  {submitting ? 'Verifying…' : 'Verify and create account'}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={submitting || resendIn > 0}
                  className="text-brand-400 hover:underline disabled:text-fg-subtle disabled:no-underline"
                >
                  {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                </button>
                <button type="button" onClick={backToDetails} className="text-fg-muted hover:text-fg transition-colors">
                  Use a different email
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
