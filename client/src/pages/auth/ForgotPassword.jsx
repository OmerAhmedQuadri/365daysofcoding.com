import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { requestPasswordReset, resetPassword } from '../../api/auth.js';
import useAuth from '../../hooks/useAuth.js';
import useCountdown from '../../hooks/useCountdown.js';
import Brand from '../../components/shared/Brand.jsx';
import PasswordInput from '../../components/shared/PasswordInput.jsx';
import CodeInput from '../../components/shared/CodeInput.jsx';

const RESEND_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 8;
const labelClass = 'block text-sm font-medium text-fg-muted mb-1';
const inputClass = 'w-full border border-line-strong rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';
const primaryButtonClass = 'w-full bg-brand-500 text-brand-950 rounded-lg py-2 text-sm font-medium hover:bg-brand-400 disabled:opacity-50 transition-colors';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('email'); // 'email', then 'reset' once a code was requested
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ code: '', new_password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendIn, setResendIn] = useCountdown();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function sendCode() {
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setStep('reset');
      setForm((f) => ({ ...f, code: '' }));
      setResendIn(RESEND_SECONDS);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEmailSubmit(e) {
    e.preventDefault();
    await sendCode();
  }

  async function handleResend() {
    if (await sendCode()) setNotice('If an account exists, we sent it a new code.');
  }

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (form.new_password !== form.confirm_password) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    try {
      const { token } = await resetPassword({ email, code: form.code, new_password: form.new_password });
      login(token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function backToEmail() {
    setStep('email');
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
          {step === 'email' ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-semibold text-fg mb-2">Reset your password</h1>
              <p className="text-sm text-fg-muted mb-6">
                Enter the email you signed up with and we&apos;ll send you a code to set a new password.
              </p>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className={labelClass}>Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {messages}

                <button type="submit" disabled={submitting} className={primaryButtonClass}>
                  {submitting ? 'Sending code…' : 'Send code'}
                </button>
              </form>

              <p className="mt-4 text-sm text-fg-muted text-center">
                Remembered it?{' '}
                <Link to="/login" className="text-brand-400 hover:underline">
                  Sign in
                </Link>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="reset"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="text-2xl font-semibold text-fg mb-2">Check your email</h1>
              <p className="text-sm text-fg-muted mb-6">
                If an account exists for <span className="text-fg">{email}</span>, we sent it a 6-digit code. It expires in 10 minutes.
              </p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label htmlFor="code" className={labelClass}>Code</label>
                  <CodeInput
                    id="code"
                    name="code"
                    required
                    autoFocus
                    value={form.code}
                    onChange={(code) => setForm((f) => ({ ...f, code }))}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="new_password" className={labelClass}>New password</label>
                  <PasswordInput
                    id="new_password"
                    name="new_password"
                    required
                    minLength={MIN_PASSWORD_LENGTH}
                    autoComplete="new-password"
                    value={form.new_password}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-fg-subtle">At least {MIN_PASSWORD_LENGTH} characters.</p>
                </div>

                <div>
                  <label htmlFor="confirm_password" className={labelClass}>Confirm new password</label>
                  <PasswordInput
                    id="confirm_password"
                    name="confirm_password"
                    required
                    autoComplete="new-password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {messages}

                <button type="submit" disabled={submitting || form.code.length !== 6} className={primaryButtonClass}>
                  {submitting ? 'Resetting…' : 'Reset password'}
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
                <button type="button" onClick={backToEmail} className="text-fg-muted hover:text-fg transition-colors">
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
