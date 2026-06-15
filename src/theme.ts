export type Theme = {
  backgroundColor: string;
  primaryColor: string;
  brandColor: string;
  codeBackground: string;
  textColor: string;
  mutedTextColor: string;
};

export const defaultTheme: Theme = {
  backgroundColor: '#150034',
  primaryColor: '#00F6BB',
  brandColor: '#4B15C1',
  codeBackground: '#0c0026',
  textColor: '#FFFFFF',
  mutedTextColor: '#B4B3B6',
};

export const resolveTheme = (override?: Partial<Theme>): Theme => ({
  ...defaultTheme,
  ...override,
});

export const BRAND_LOGO_URL =
  'https://res.cloudinary.com/khriztianmoreno/image/upload/v1622902238/km_site/Asset_15.png';
