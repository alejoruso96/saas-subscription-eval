import type { ButtonHTMLAttributes, Ref } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'secondary';
  ref?: Ref<HTMLButtonElement>;
};

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-ink disabled:bg-line disabled:text-muted',
  secondary:
    'border border-line bg-card text-foreground hover:border-ink/30 disabled:opacity-50',
  ghost: 'text-foreground hover:bg-ink/5 disabled:opacity-50',
};

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
