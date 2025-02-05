import { Platform } from 'react-native'

const getFontFamily = (weight: string) => {
  if (Platform.OS === 'ios') {
    return {
      fontFamily: 'System',
      fontWeight: weight,
    }
  }
  
  // Android font mappings
  const fontMappings: { [key: string]: string } = {
    '400': 'Roboto',
    '500': 'Roboto-Medium',
    '600': 'Roboto-Medium',
    '700': 'Roboto-Bold',
    '900': 'Roboto-Black',
  }
  
  return {
    fontFamily: fontMappings[weight] || 'Roboto',
    fontWeight: weight,
  }
}

export const typography = {
  fonts: {
    regular: getFontFamily('400'),
    medium: getFontFamily('500'),
    bold: getFontFamily('700'),
    heavy: getFontFamily('900'),
  },
  
  // Font sizes
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  // Font weights
  weights: {
    regular: '400',
    medium: '500',
    bold: '700',
    heavy: '900',
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Predefined text styles
  variants: {
    h1: {
      fontSize: 32,
      ...getFontFamily('700'),
      lineHeight: 1.2,
    },
    h2: {
      fontSize: 24,
      ...getFontFamily('700'),
      lineHeight: 1.2,
    },
    h3: {
      fontSize: 20,
      ...getFontFamily('600'),
      lineHeight: 1.2,
    },
    body1: {
      fontSize: 16,
      ...getFontFamily('400'),
      lineHeight: 1.5,
    },
    body2: {
      fontSize: 14,
      ...getFontFamily('400'),
      lineHeight: 1.5,
    },
    caption: {
      fontSize: 12,
      ...getFontFamily('400'),
      lineHeight: 1.5,
    },
  },
} 