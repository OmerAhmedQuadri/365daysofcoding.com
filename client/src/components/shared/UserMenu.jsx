import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth.js';

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
    </svg>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}>
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

const ITEMS = [
  { to: '/profile', label: 'Profile' },
  { to: '/settings', label: 'Settings' },
];

// Opens on hover, and on click or keyboard for touch screens and accessibility
export default function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const closeTimer = useRef(null);

  function show() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function hideSoon() {
    // Short delay so the pointer can travel from the button into the menu
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <div ref={containerRef} className="relative" onMouseEnter={show} onMouseLeave={hideSoon}>
      <button
        type="button"
        onClick={show}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-fg-muted hover:bg-raised hover:text-fg transition-colors"
      >
        <UserIcon />
        User
        <ChevronIcon open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 pt-2"
          >
            <div role="menu" className="w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-xl">
              <div className="border-b border-line px-4 py-3">
                <p className="truncate text-sm font-medium text-fg">{user?.name}</p>
                <p className="truncate text-xs text-fg-subtle">{user?.email}</p>
              </div>
              <div className="py-1">
                {ITEMS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-sm text-fg-muted hover:bg-raised hover:text-fg transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
