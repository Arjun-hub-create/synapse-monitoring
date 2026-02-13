# Synapse Frontend 🎨

Modern React dashboard for real-time system monitoring with a futuristic cyberpunk design.

## Features

✅ **Modern UI/UX**
- Dark cyberpunk theme with neon colors
- Smooth animations with Framer Motion
- Responsive design for all devices
- Interactive charts and visualizations

✅ **Real-time Monitoring**
- Live service status updates
- WebSocket integration for instant alerts
- Performance metrics visualization
- System health overview

✅ **Authentication**
- User login and registration
- JWT token management
- Protected routes
- Auto token refresh

✅ **Dashboard Pages**
- Service monitoring dashboard
- Status visualization with charts
- Alert management interface
- System logs viewer
- Service details page

✅ **Charts & Analytics**
- Service status distribution pie chart
- Response time bar charts
- Line charts for trends
- Real-time metric updates

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with custom cyberpunk theme
- **Framer Motion** - Smooth animations
- **Recharts** - Charts and visualizations
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Zustand** - State management
- **Vite** - Fast build tool

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── UI.tsx        # Button, Card, Input, etc.
│   │   ├── Header.tsx    # Top navigation
│   │   ├── Sidebar.tsx   # Left navigation
│   │   └── StatusIndicator.tsx
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── AlertsPage.tsx
│   │   ├── LogsPage.tsx
│   │   └── index.ts
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.ts    # Zustand auth store
│   │   ├── useUI.ts      # Zustand UI store
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── api.ts        # API client setup
│   │   └── index.ts      # Helper functions
│   ├── types/            # TypeScript interfaces
│   │   └── index.ts
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html           # HTML template
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ with npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Start development server**

```bash
npm run dev
```

Server runs at: `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Optimized build output in `dist/` directory.

## API Integration

The frontend connects to the backend API at `http://localhost:8000/api/v1`

### Available API Endpoints

All endpoints require `Authorization: Bearer {token}` header

**Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token

**Services**
- `GET /services` - List all services
- `GET /services/{id}` - Get service details
- `POST /services` - Create new service
- `PATCH /services/{id}` - Update service
- `DELETE /services/{id}` - Delete service

**Health Checks**
- `POST /health/{service_id}/check` - Manual health check
- `GET /health/{service_id}/history` - Check history
- `GET /health/{service_id}/metrics` - Service metrics
- `GET /health/all/metrics` - All services metrics

**Alerts**
- `GET /alerts` - List alerts
- `POST /alerts/{id}/resolve` - Resolve alert
- `GET /alerts/{service_id}/service` - Service alerts

**WebSocket**
- `WS /ws/metrics/{token}` - Live metrics stream

## Styling System

### Color Palette

- **Primary Neon Cyan**: `#00d9ff`
- **Secondary Neon Pink**: `#ff006e`
- **Tertiary Neon Purple**: `#a000ff`
- **Success Neon Green**: `#39ff14`
- **Background Dark**: `#0a0e27`
- **Cards Dark**: `#1a1f3a`
- **Borders**: `#2a2f4a`

### Custom Classes

```tsx
// Pre-built Tailwind classes
.glass         // Glass morphism effect
.glow-sm       // Small shadow glow
.glow-md       // Medium shadow glow
.glow-lg       // Large shadow glow
.neon-text     // Neon glowing text
.dark-input    // Dark themed input
.card-hover    // Card hover effect
```

## Components

### UI Components

**Button**
```tsx
<Button variant="primary|secondary|tertiary|outline|ghost" size="sm|md|lg" />
```

**Card**
```tsx
<Card className="custom-class">
  Content here
</Card>
```

**Input & Label**
```tsx
<Label>Email</Label>
<Input type="email" placeholder="user@example.com" />
```

**Badge**
```tsx
<Badge status="info|success|warning|error">Active</Badge>
```

**Modal**
```tsx
<Modal isOpen={isOpen} onClose={closeModal} title="Title">
  Content
</Modal>
```

**StatusIndicator**
```tsx
<StatusIndicator status="healthy|unhealthy|degraded|unknown" />
```

## State Management

### Auth Store (Zustand)

```tsx
import { useAuthStore } from '@/hooks';

const { user, accessToken, login, register, logout } = useAuthStore();
```

### UI Store (Zustand)

```tsx
import { useUIStore } from '@/hooks';

const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();
```

## Animations

All components use Framer Motion for smooth animations:

- Page transitions
- Card hover effects
- Button interactions
- Status indicator pulses
- List item animations

## Responsive Design

- **Mobile First** approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile menu with sidebar toggle
- Responsive grid layouts

## Performance

- Lazy loading with React Router
- Code splitting via Vite
- Image optimization
- CSS-in-JS optimization
- Debounced API calls

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Environment Variables

Create `.env` file (if needed for API URL override):

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Troubleshooting

### CORS Issues
Ensure backend CORS is configured to accept requests from `http://localhost:5173`

### WebSocket Connection Failed
Check if WebSocket endpoint is accessible at `ws://localhost:8000/ws/metrics/{token}`

### Styling Not Applied
Ensure Tailwind CSS is properly configured and index.css is imported in main.tsx

## Development Tips

### Hot Module Replacement
Vite provides instant HMR for faster development

### TypeScript
Use TypeScript for type safety. Run `npm run type-check` to validate

### Format Code
```bash
npm run lint
```

## Production Deployment

1. Build the app:
```bash
npm run build
```

2. Deploy `dist/` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages
   - Any static hosting

3. Configure environment variables for production API URL

## Performance Checklist

- [ ] Run production build
- [ ] Test with slow 3G network
- [ ] Check Lighthouse scores
- [ ] Verify bundle size
- [ ] Test on mobile devices
- [ ] Check animation performance

## Future Enhancements

- [ ] Service registration form
- [ ] Service details page with full metrics
- [ ] Advanced filtering and search
- [ ] Custom dashboard layouts
- [ ] Dark/Light theme toggle
- [ ] Notification system
- [ ] Export reports as PDF
- [ ] Real-time WebSocket updates
- [ ] User preferences
- [ ] Multi-language support

## Contributing

When adding new components:

1. Follow the existing component structure
2. Use TypeScript interfaces
3. Add Tailwind classes for styling
4. Include animations with Framer Motion
5. Make components reusable
6. Document props and usage

## Security

- Tokens stored in localStorage
- JWT validation on protected routes
- Secure API calls with headers
- Input validation
- XSS protection via React

## License

MIT License - Built for production use

## Support

For issues or questions, please check the main Synapse repository.

---

Built with ❤️ for modern system monitoring

**Quick Links**
- Backend: [../backend](../backend)
- API Docs: http://localhost:8000/api/v1/docs
-Design: Cyberpunk Dark Theme
