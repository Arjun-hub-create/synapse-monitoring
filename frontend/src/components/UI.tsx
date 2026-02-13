/**
 * Reusable UI Components
 */

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: any) => {
  const baseStyles =
    'font-semibold rounded transition-all duration-200 cursor-pointer focus:outline-none';

  const variants: Record<string, string> = {
    primary: 'bg-neon-cyan text-dark-bg hover:shadow-neon-cyan',
    secondary: 'bg-neon-pink text-white hover:shadow-neon-pink',
    tertiary: 'bg-neon-purple text-white hover:shadow-neon-purple',
    outline: 'border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10',
    ghost: 'text-neon-cyan hover:bg-neon-cyan/10',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Card = ({ children, className = '' }: any) => (
  <div className={`bg-dark-card border border-dark-border rounded-lg p-6 ${className}`}>
    {children}
  </div>
);

export const Input = ({ className = '', ...props }: any) => (
  <input
    className={`w-full bg-dark-bg border border-neon-cyan/30 rounded px-4 py-2 text-dark-text placeholder-gray-500 focus:outline-none focus:border-neon-cyan focus:shadow-neon-cyan ${className}`}
    {...props}
  />
);

export const Label = ({ children, className = '' }: any) => (
  <label className={`block text-sm font-medium text-dark-text mb-2 ${className}`}>
    {children}
  </label>
);

export const Badge = ({ children, className = '', status = 'info' }: any) => {
  const statusStyles: Record<string, string> = {
    info: 'bg-neon-cyan/20 text-neon-cyan',
    success: 'bg-neon-green/20 text-neon-green',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-neon-pink/20 text-neon-pink',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]} ${className}`}>
      {children}
    </span>
  );
};

export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neon-cyan">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-neon-cyan transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
};

export const Spinner = ({ size = 'md' }: any) => {
  const sizeClasses: Record<string, string> = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin`} />
  );
};

export const Alert = ({ children, type = 'info', className = '' }: any) => {
  const typeStyles: Record<string, string> = {
    info: 'bg-neon-cyan/10 border-neon-cyan text-neon-cyan',
    success: 'bg-neon-green/10 border-neon-green text-neon-green',
    warning: 'bg-yellow-500/10 border-yellow-500 text-yellow-400',
    error: 'bg-neon-pink/10 border-neon-pink text-neon-pink',
  };

  return (
    <div className={`border rounded-lg p-4 ${typeStyles[type]} ${className}`}>
      {children}
    </div>
  );
};
