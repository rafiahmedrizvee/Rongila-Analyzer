const VARIANTS = {
  primary: 'bg-ink text-paper hover:bg-ink-soft',
  accent: 'bg-accent text-paper hover:bg-accent-dark',
  outline: 'border border-ink/20 text-ink hover:border-ink/50 bg-transparent',
  ghost: 'text-ink hover:bg-ink/5 bg-transparent',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  children,
  ...props
}) {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-sm',
    lg: 'px-7 py-4 text-base',
  }

  return (
    <Tag
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon size={18} strokeWidth={2} />}
      {children}
      {Icon && iconPosition === 'right' && <Icon size={18} strokeWidth={2} />}
    </Tag>
  )
}
