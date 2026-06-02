import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiUser, HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { isValidEmail, validatePassword } from '../utils/validators';

export default function Signup() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const setField = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())               e.name     = 'Name is required';
    if (!form.email)                     e.email    = 'Email is required';
    else if (!isValidEmail(form.email))  e.email    = 'Enter a valid email address';
    const pwd = validatePassword(form.password);
    if (!pwd.valid)                      e.password = pwd.message;
    if (form.password !== form.confirm)  e.confirm  = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await signup(form.name.trim(), form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const pwdLen = form.password.length;
  const strength = pwdLen === 0 ? 0 : pwdLen < 6 ? 1 : pwdLen < 10 ? 2 : 3;
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Heading */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">
          Create your account
        </h1>
        <p className="text-slate-500 text-sm">
          Free forever. No credit card required.
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

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          error={errors.name}
          leftIcon={<HiUser className="text-base" />}
        />

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

        <div>
          <Input
            label="Password"
            type={showPwd ? 'text' : 'password'}
            placeholder="At least 6 characters"
            autoComplete="new-password"
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
          {/* Password strength bar */}
          {form.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3].map(level => (
                  <div
                    key={level}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      strength >= level ? strengthColors[strength] : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs ${
                strength === 1 ? 'text-rose-400' : strength === 2 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {strengthLabels[strength]} password
              </p>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type={showPwd ? 'text' : 'password'}
          placeholder="Repeat your password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={(e) => setField('confirm', e.target.value)}
          error={errors.confirm}
          leftIcon={<HiLockClosed className="text-base" />}
        />

        <Button
          type="submit"
          variant="brand"
          loading={loading}
          className="w-full mt-2"
          size="lg"
        >
          Create Account
        </Button>
      </form>

      {/* Terms note */}
      <p className="mt-4 text-center text-xs text-slate-600">
        By signing up you agree to our{' '}
        <span className="text-slate-500 cursor-pointer hover:text-slate-300">Terms of Service</span>{' '}
        and{' '}
        <span className="text-slate-500 cursor-pointer hover:text-slate-300">Privacy Policy</span>.
      </p>

      {/* Login link */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-white/[0.07]" />
        <span className="text-xs text-slate-600 font-body">or</span>
        <div className="flex-1 h-px bg-white/[0.07]" />
      </div>
      <p className="text-center text-slate-500 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-display font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}