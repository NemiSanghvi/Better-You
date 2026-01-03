import { StyleSheet } from 'react-native';

// Theme Colors - Retro 8-bit game aesthetic matching the logo
const colors = {
  // Logo-inspired gradient colors
  gradientStart: '#FF6B35',      // Reddish-orange (top of gradient)
  gradientEnd: '#FFD23F',         // Bright yellow (bottom of gradient)
  golden: '#FFA500',              // Golden-orange border
  goldenLight: '#FFB84D',         // Lighter golden
  goldenDark: '#FF8C00',          // Darker golden
  
  // Background and surfaces
  background: '#000000',          // Black background (like logo)
  surface: '#1A1A1A',             // Dark surface
  surfaceLight: '#2A2A2A',       // Lighter dark surface
  
  // Star colors from logo
  starPink: '#FF69B4',            // Pink stars
  starYellow: '#FFD700',          // Yellow/golden stars
  
  // Text colors
  textPrimary: '#FFD23F',         // Yellow text (matching logo)
  textSecondary: '#FFA500',       // Golden text
  textLight: '#FFB84D',           // Light golden text
  textDark: '#FF6B35',            // Darker orange text
  
  // Borders and accents
  border: '#FFA500',               // Golden border
  borderFocus: '#FFD23F',          // Bright yellow focus
  borderDark: '#FF8C00',           // Darker border
  
  // Interactive elements
  button: '#FF6B35',               // Orange button
  buttonHover: '#FF8C42',          // Lighter orange
  disabled: '#4A4A4A',             // Dark gray disabled
  success: '#FFD23F',              // Yellow success
  
  // Shadows (minimal for retro feel)
  shadow: 'rgba(255, 163, 0, 0.3)',
};

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  prompt: {
    fontSize: 18,
    marginBottom: 30,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    maxWidth: 300,
    height: 50,
    borderWidth: 2,
    borderColor: colors.golden,
    borderRadius: 12,
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  multilineInput: {
    width: '100%',
    maxWidth: 300,
    minHeight: 120,
    borderWidth: 2,
    borderColor: colors.golden,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  companionContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 15,
  },
  companionOption: {
    borderWidth: 2,
    borderColor: colors.golden,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  companionOptionSelected: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.surfaceLight,
    borderWidth: 3,
  },
  companionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: colors.textPrimary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  companionDescription: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 0,
    marginBottom: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    marginTop: 15,
    borderWidth: 2,
    borderColor: colors.golden,
    alignSelf: 'center',
  },
  cardFirst: {
    marginTop: 20,
  },
  cardText: {
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 0,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  button: {
    backgroundColor: colors.button,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 140,
    borderWidth: 2,
    borderColor: colors.golden,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
    borderColor: '#2A2A2A',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Star decoration styles
  star: {
    fontSize: 20,
    color: colors.starYellow,
  },
  starPink: {
    fontSize: 20,
    color: colors.starPink,
  },
});

