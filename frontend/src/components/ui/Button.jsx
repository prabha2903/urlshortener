import React from 'react';
import Spinner from './Spinner';

/**
 * Reusable button component with variants
 * @param {'brand'|'ghost'|'danger'} variant
 */
export default function Button({
  children,
  variant = 'brand',
  loading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  size = 'md',
  ...props
}) {
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Variant classes
  const variantClasses = {
    brand:  'btn-brand',
    ghost:  'btn-ghost',
    danger: 'btn-danger',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
}