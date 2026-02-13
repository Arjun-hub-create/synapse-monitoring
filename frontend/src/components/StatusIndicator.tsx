/**
 * Status Indicator Component
 */
import { motion } from 'framer-motion';

interface StatusIndicatorProps {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
  label?: string;
}

export const StatusIndicator = ({ status, label }: StatusIndicatorProps) => {
  const statusConfig = {
    healthy: {
      color: '#39ff14',
      label: 'Healthy',
      animation: { boxShadow: ['0 0 10px rgba(57, 255, 20, 0.5)', '0 0 20px rgba(57, 255, 20, 0.8)'] },
    },
    unhealthy: {
      color: '#ff006e',
      label: 'Unhealthy',
      animation: { boxShadow: ['0 0 10px rgba(255, 0, 110, 0.5)', '0 0 20px rgba(255, 0, 110, 0.8)'] },
    },
    degraded: {
      color: '#fbbf24',
      label: 'Degraded',
      animation: { boxShadow: ['0 0 10px rgba(251, 191, 36, 0.5)', '0 0 15px rgba(251, 191, 36, 0.7)'] },
    },
    unknown: {
      color: '#9ca3af',
      label: 'Unknown',
      animation: { boxShadow: '0 0 0px rgba(156, 163, 175, 0)' },
    },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      animate={config.animation}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="flex items-center gap-2"
    >
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <span style={{ color: config.color }} className="font-semibold text-sm">
        {label || config.label}
      </span>
    </motion.div>
  );
};

export default StatusIndicator;
