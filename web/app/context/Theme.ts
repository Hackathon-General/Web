export const colors = {
  terracotta: '#D68C45',
  forest: '#2C6E49',
  deepGreen: '#2A3C2C',
  mint: '#60D394',
  sky: '#A6E1F1',
  gold: '#FFCF56',
  ink: '#212121',
  white: '#FFFFFF',
  bg: '#FEF6ED', 
  muted: '#646464',
  line: '#F0F0F0',
  danger: '#DF3131', 
  success: '#0DC143',
} as const;

export const valueTheme: Record<string, { label: string; color: string }> = {
  loveOfLand:    { label: 'אהבת הארץ',  color: '#2C6E49' },
  justice:       { label: 'צדק',         color: '#FFCF56' },
  volunteering:  { label: 'התנדבות',     color: '#D68C45' },
  seeingOther:   { label: 'ראיית האחר',  color: '#A6E1F1' },
  coexistence:   { label: 'חיים משותפים', color: '#60D394' },
};