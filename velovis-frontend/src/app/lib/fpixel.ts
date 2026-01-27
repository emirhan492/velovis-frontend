export const FB_PIXEL_ID = '744934802004617'; // ID

// Sayfa görüntüleme
export const pageview = () => {
  if (typeof window !== 'undefined') {
    window.fbq('track', 'PageView');
  }
};

// Standart Olaylar için fonksiyon
export const event = (name: string, options: any = {}) => {
  if (typeof window !== 'undefined') {
    window.fbq('track', name, options);
  }
};

declare global {
  interface Window {
    fbq: any;
  }
}