interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  fullWidth?: boolean
  className?: string
}

const VARIANTS = {
  primary:   'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500',
  secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600',
  ghost:     'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700',
  danger:    'bg-red-700 hover:bg-red-600 text-white border border-red-600',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, fullWidth = false, className = '',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${VARIANTS[variant]} ${SIZES[size]}
        rounded-lg font-medium transition-all duration-150
        cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim()}
    >
      {children}
    </button>
  )
}
