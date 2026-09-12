# Partner Pages - Common CSS Theme Guide

## Overview
All Partner and PartnerSettings pages now use a centralized CSS theme to maintain consistency and reduce code duplication.

## How to Use

### 1. Import Common CSS
Add this import at the top of each page CSS file:
```css
@import './shared/PartnerCommon.css';
```

### 2. Replace Container Classes
Update your component's main container class:

**Before:**
```jsx
<div className="banner-container">
```

**After:**
```jsx
<div className="partner-page-container">
```

### 3. Use Common Class Names
Replace page-specific classes with common ones:

| Old Class | New Common Class |
|-----------|------------------|
| `.banner-container .page-header` | `.partner-page-header` |
| `.banner-container .page-title` | `.partner-page-title` |
| `.banner-container .page-subtitle` | `.partner-page-subtitle` |
| `.banner-container .page-header-actions` | `.partner-page-header-actions` |
| `.banner-container .add-btn` | `.partner-btn-primary` |
| `.banner-container .refresh-btn` | `.partner-btn-refresh` |
| `.banner-container .ant-table` | `.partner-table-container` |
| `.banner-container .toggle-switch` | `.partner-toggle-switch` |
| `.banner-drawer` | `.partner-drawer` |
| `.banner-form` | `.partner-form` |

### 4. Remove Duplicate Styles
Delete from individual CSS files:
- Page layout/padding
- Header/title/subtitle styles
- Button styles
- Table header/body styles
- Toggle switch styles
- Pagination styles
- Drawer styles
- Form styles

### 5. Keep Page-Specific Styles
Only keep in individual CSS files:
- Page-specific color schemes (if different)
- Custom component styling
- Layout variations unique to that page

## Example Implementation

### Before (Old Structure)
```jsx
// Banner.jsx
import './Banner.css';

return (
  <div className="banner-container">
    <div className="page-header">
      <div className="page-header-content">
        <h1 className="page-title">Banner</h1>
```

```css
/* Banner.css */
.banner-container {
  padding: 24px 32px;
  background: #f5f7fa;
}

.banner-container .page-header {
  display: flex;
  align-items: flex-start;
  ...
}
```

### After (New Structure)
```jsx
// Banner.jsx
import '../shared/PartnerCommon.css';
import './Banner.css';

return (
  <div className="partner-page-container">
    <div className="partner-page-header">
      <div className="partner-page-header-content">
        <h1 className="partner-page-title">Banner</h1>
```

```css
/* Banner.css */
@import '../shared/PartnerCommon.css';

/* Only page-specific overrides or custom styles */
.banner-custom-component {
  /* Custom styling specific to Banner page */
}
```

## Available Common Classes

### Layout
- `.partner-page-container` - Main container
- `.partner-page-header` - Page header
- `.partner-page-header-content` - Header content area
- `.partner-page-header-actions` - Header action buttons

### Typography
- `.partner-page-title` - Page title (26px, bold)
- `.partner-page-subtitle` - Page subtitle (14px)

### Buttons
- `.partner-btn-primary` - Primary green button
- `.partner-btn-secondary` - Secondary button
- `.partner-btn-refresh` - Refresh button

### Cards & Containers
- `.partner-card` - Generic card
- `.partner-filter-card` - Filter/toolbar card
- `.partner-table-card` - Table container card

### Tables
- `.partner-table-container` - Table with standard styling
- `.partner-table-container-light` - Table with light background

### Forms
- `.partner-form` - Form styling
- `.partner-form .ant-input` - Input field
- `.partner-form .ant-select-selector` - Select dropdown

### Components
- `.partner-toggle-switch` - Toggle switch
- `.partner-action-dropdown` - Action menu dropdown
- `.partner-action-menu` - Action menu items
- `.partner-status-badge` - Status badge (active/inactive/pending)

### Utilities
- `.partner-empty-state` - Empty state display
- `.partner-pagination` - Pagination styling
- `.partner-drawer` - Drawer/modal styling

## Migration Checklist

- [ ] Import PartnerCommon.css in component
- [ ] Update container div classes
- [ ] Replace all page-specific classes with common ones
- [ ] Remove duplicate CSS from individual files
- [ ] Test responsive design (mobile/tablet)
- [ ] Verify all interactive elements work
- [ ] Check color consistency
- [ ] Ensure pagination displays correctly
- [ ] Test table sorting/scrolling
- [ ] Verify drawer/modal styling

## Theme Colors

All pages use the same color scheme:
- **Primary Green:** `#2a9629` (buttons, active states)
- **Hover Green:** `#228721`
- **Light Gray:** `#f8f9fb` (headers)
- **Text Dark:** `#4b5563` (headers)
- **Text Body:** `#374151` (table content)
- **Border:** `#e5e7eb`
- **Light Background:** `#f5f7fa`

## Support

For questions or issues with the common theme:
1. Check existing implementations in similarly-structured pages
2. Refer to the PartnerCommon.css source
3. Maintain consistency across all Partner pages
