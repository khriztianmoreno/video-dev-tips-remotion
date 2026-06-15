export type LayoutMetrics = {
  safePaddingX: number;
  titleTop: number;
  titleFontSize: number;
  titlePadX: number;
  titlePadY: number;
  titleRadius: number;
  contentTop: number;
  contentBottom: number;
  contentGap: number;
  stepTitleFontSize: number;
  codeFontSize: number;
  codePadding: number;
  codeRadius: number;
  narrationFontSize: number;
  footerWidth: number;
  footerOffset: number;
};

export const getLayoutMetrics = (width: number, height: number): LayoutMetrics => {
  const ratio = width / height;
  const isLandscape = ratio > 1.3;
  const isSquare = Math.abs(ratio - 1) < 0.15;

  const shortSide = Math.min(width, height);
  const u = shortSide / 100;

  return {
    safePaddingX: u * 7,
    titleTop: u * (isLandscape ? 5 : 9),
    titleFontSize: u * (isLandscape ? 4.5 : 5),
    titlePadX: u * 4,
    titlePadY: u * 2,
    titleRadius: u * 2.6,
    contentTop: u * (isLandscape ? 22 : isSquare ? 26 : 28),
    contentBottom: u * (isLandscape ? 18 : isSquare ? 22 : 24),
    contentGap: u * 3.8,
    stepTitleFontSize: u * (isLandscape ? 4.8 : 5.2),
    codeFontSize: u * 3.4,
    codePadding: u * 3,
    codeRadius: u * 1.5,
    narrationFontSize: u * 3,
    footerWidth: u * (isLandscape ? 11 : 13),
    footerOffset: u * 5,
  };
};
