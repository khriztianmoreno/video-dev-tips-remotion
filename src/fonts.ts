import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';

const inter = loadInter('normal', {
  weights: ['400', '600', '800'],
  subsets: ['latin'],
});

const jetbrains = loadJetBrainsMono('normal', {
  weights: ['400', '500'],
  subsets: ['latin'],
});

export const interFontFamily = inter.fontFamily;
export const codeFontFamily = jetbrains.fontFamily;
