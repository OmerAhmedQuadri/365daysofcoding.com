// Field for the 6-digit codes emailed for sign-up and password reset. Keeps digits only.
export default function CodeInput({ value, onChange, className = '', ...props }) {
  return (
    <input
      inputMode="numeric"
      autoComplete="one-time-code"
      maxLength={6}
      pattern="[0-9]{6}"
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      className={`${className} text-center text-lg tracking-[0.5em]`}
    />
  );
}
