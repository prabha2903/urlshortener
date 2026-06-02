import React, { forwardRef } from 'react';

/**
 * Reusable form input with label and error states
 */
const Input = forwardRef(function Input(
  { label, error, helperText, leftIcon, rightElement, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block mb-1.5 text-xs font-display font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* Input wrapper for icon support */}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`form-input ${leftIcon ? 'pl-10' : ''} ${rightElement ? 'pr-12' : ''} ${
            error ? 'border-rose-500/50 focus:!border-rose-500/80' : ''
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>

      {/* Error or helper text */}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Input;