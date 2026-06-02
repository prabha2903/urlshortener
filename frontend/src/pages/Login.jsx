import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { isValidEmail } from '../utils/validators';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Update a single form field
  const setField = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  // Client-side validation
  const validate = () => {
    const e = {};
    if (!form.email)               e.email    = 'Email is required';
    else if (!isValidEmail(form.email)) e.email = 'Enter a valid email address';
    if (!form.password)            e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      // Show field-level error if 401, else general error
      setErrors({ general: err.message || 'Invalid credentials' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Heading */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
          Welcome back
        </h1>
        <p className="text-slate-500 text-sm">
          Sign in to your LinkSnap account
        </p>
      </div>

      {/* General error */}
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm"
        >
          {errors.general}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          leftIcon={<HiMail className="text-base" />}
        />

        <Input
          label="Password"
          type={showPwd ? 'text' : 'password'}
          placeholder="••••••••"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setField('password', e.target.value)}
          error={errors.password}
          leftIcon={<HiLockClosed className="text-base" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPwd(p => !p)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
              tabIndex={-1}
            >
              {showPwd ? <HiEyeOff className="text-base" /> : <HiEye className="text-base" />}
            </button>
          }
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="brand"
          loading={loading}
          className="w-full mt-2"
          size="lg"
        >
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-white/[0.07]" />
        <span className="text-xs text-slate-600 font-body">or</span>
        <div className="flex-1 h-px bg-white/[0.07]" />
      </div>

      {/* Signup link */}
      <p className="text-center text-slate-500 text-sm">
        Don't have an account?{' '}
        <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-display font-medium transition-colors">
          Create one free
        </Link>
      </p>
    </motion.div>
  );
}