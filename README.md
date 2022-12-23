# DNB Eufemia VSCode Extension

This extension will include tools and helpers to enhance DX and make devs more productive during development while using Eufemia as their design system tool.

## Spacing helpers and conversion

When inside files like: CSS, SCSS, Emotion or Styled Components.

![](./assets/Eufemia-VSCode-Extension-with-CSS.gif)

### Spacing types

Spacing types are Eufemia spatial system units like; large, medium, small. They can and should be used when defining spacing between components:

```css
div {
  margin-top: var(--spacing-small); /* 1rem (16px) */
}
```

- Convert pixel values to "spacing types". Effects CSS properties like margin, padding etc.
- When cursor is on line, show "spacing types" summary in rem and pixel.

### Other pixel values

- Convert pixel values to rem value.
- When cursor is on line, show rem value of pixel.
