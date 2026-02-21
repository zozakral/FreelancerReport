# Assets Directory

This directory contains all static assets for the Freelancer Report application.

## Structure

- **logo/** - Application logos in various sizes
  - `logo.svg` - Main logo (200x200px)
  - `logo-small.svg` - Compact logo for favicon/small displays (64x64px)

- **icons/** - UI icons (24x24px, scalable)
  - Navigation: `dashboard.svg`, `report.svg`, `company.svg`, `activity.svg`, `time.svg`, `user.svg`, `settings.svg`
  - Actions: `add.svg`, `edit.svg`, `delete.svg`, `download.svg`, `save.svg`, `logout.svg`
  - UI Elements: `calendar.svg`, `check.svg`, `alert.svg`, `close.svg`, `menu.svg`

## Usage

### In HTML
```html
<!-- Logo -->
<img src="/src/assets/logo/logo.svg" alt="Freelancer Report" width="200" height="200">

<!-- Icon -->
<img src="/src/assets/icons/dashboard.svg" alt="Dashboard" width="24" height="24">
```

### In CSS
```css
.icon-dashboard {
  background-image: url('/src/assets/icons/dashboard.svg');
  width: 24px;
  height: 24px;
}
```

### Inline (for dynamic coloring)
```html
<button>
  <svg class="icon">
    <use href="/src/assets/icons/add.svg#icon"/>
  </svg>
  Add Item
</button>
```

## Icon Design

All icons are:
- 24x24px viewBox (scalable)
- 2px stroke width
- `currentColor` stroke (inherits text color)
- No fill (outline style)
- Round line caps and joins

## Customization

Icons use `stroke="currentColor"` which means they inherit the text color from their parent element. You can change icon colors using CSS:

```css
.btn-primary .icon {
  color: white;
}

.btn-danger .icon {
  color: #dc3545;
}
```
