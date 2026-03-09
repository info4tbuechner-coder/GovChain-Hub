import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          manifest: {
            name: 'GovChain Hub',
            short_name: 'GovChain',
            description: 'Souveräne Blockchain-Infrastruktur für den deutschen Staat. SSI-Identity, Dokumententransfer und Compliance Monitoring.',
            theme_color: '#0f172a',
            background_color: '#0f172a',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            shortcuts: [
              {
                name: 'Lagezentrum',
                short_name: 'Krise',
                description: 'Notfallprotokolle einsehen',
                url: '/#/crisis',
                icons: [
                  {
                    src: 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/alert-octagon.svg',
                    sizes: '192x192'
                  }
                ]
              },
              {
                name: 'E-Akte',
                short_name: 'Signatur',
                description: 'Dokumente unterzeichnen',
                url: '/#/signatures',
                icons: [
                  {
                    src: 'https://raw.githubusercontent.com/lucide-react/lucide/main/icons/pen-tool.svg',
                    sizes: '192x192'
                  }
                ]
              }
            ],
            screenshots: [
              {
                src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000',
                sizes: '1000x600',
                type: 'image/jpeg',
                form_factor: 'wide',
                label: 'GovChain Dashboard Desktop'
              },
              {
                src: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=600&h=1000',
                sizes: '600x1000',
                type: 'image/jpeg',
                form_factor: 'narrow',
                label: 'GovChain Mobile Wallet'
              }
            ],
            icons: [
              {
                src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bundesadler_Bundesrepublik_Deutschland_%281997%29.svg/192px-Bundesadler_Bundesrepublik_Deutschland_%281997%29.svg.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bundesadler_Bundesrepublik_Deutschland_%281997%29.svg/512px-Bundesadler_Bundesrepublik_Deutschland_%281997%29.svg.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/cdn\.tailwindcss\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'tailwind-cdn',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'external-icons',
                  expiration: {
                    maxEntries: 10,
                    maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              },
              {
                urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'external-images',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 30 // <== 30 days
                  },
                  cacheableResponse: {
                    statuses: [0, 200]
                  }
                }
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
