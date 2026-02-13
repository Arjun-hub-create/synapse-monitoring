/**
 * Header Component
 */
import { useAuthStore, useUIStore } from '@/hooks';
import { Menu, LogOut, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Header = () => {
  const navigate = useNavigate();
  const { toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-dark-card border-b border-dark-border sticky top-0 z-40"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-dark-bg rounded transition-colors"
          >
            <Menu size={24} className="text-neon-cyan" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Home size={24} className="text-neon-cyan" />
            <span className="text-xl font-bold text-neon-cyan animate-glow">Synapse</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded bg-neon-pink/20 text-neon-pink hover:bg-neon-pink/30 transition-all"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </motion.header>
  );
};

export default Header;
