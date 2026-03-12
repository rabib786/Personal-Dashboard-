## 2026-03-12 - Missing ARIA labels on icon-only buttons
**Learning:** Found several icon-only buttons (like the theme toggle, settings, and modal close buttons) and inputs (like the search bar and to-do input) that lacked `aria-label` attributes. This is a common accessibility issue that makes it difficult for screen reader users to understand the purpose of these interactive elements.
**Action:** Always ensure that buttons without text content and inputs without explicit associated `<label>` elements have an appropriate `aria-label` or `title` to provide context for assistive technologies.
