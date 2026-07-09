// Ant Design Theme Configuration
export const antdTheme = {
  token: {
    colorPrimary: '#16a34a', // Green theme color
    colorSuccess: '#16a34a',
    colorInfo: '#3b82f6',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    borderRadius: 8,
    fontSize: 14,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  },
  components: {
    Table: {
      headerBg: '#f9fafb',
      headerColor: '#374151',
      rowHoverBg: '#f0fdf4',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(22, 163, 74, 0.1)',
    },
    Card: {
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    },
  },
};
