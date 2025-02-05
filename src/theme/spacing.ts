export const spacing = {
  // Base spacing unit (4px)
  unit: 4,
  
  // Spacing shortcuts
  xs: 4,    // Extra small: 4px
  sm: 8,    // Small: 8px
  md: 16,   // Medium: 16px
  lg: 24,   // Large: 24px
  xl: 32,   // Extra large: 32px
  xxl: 48,  // Extra extra large: 48px
  
  // Layout spacing
  container: 16,
  screen: 16,
  section: 24,
  
  // Component specific
  buttonPadding: 16,
  inputPadding: 12,
  cardPadding: 16,
  listItemPadding: 12,
}

// Helper function to multiply spacing
export const multiply = (value: number, multiplier: number) => value * multiplier 