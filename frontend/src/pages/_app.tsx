import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { TransitionWrapper } from '@/components/TransitionWrapper';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { InstallPrompt } from '@/components/InstallPrompt';
import { CapacitorDetector } from '@/components/CapacitorDetector';

if (typeof window !== "undefined") {
  console.log("ENV CHECK → BACKEND URL =", process.env.NEXT_PUBLIC_BACKEND_URL);
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-950 via-purple-950 to-black">
        {/* Subtle noise texture overlay for cinematic depth */}
        <div 
          className="fixed inset-0 opacity-[0.015] pointer-events-none z-0"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
          }}
        />
        
        <Navbar />
        
        <main className="flex-1 relative z-10">
          <AnimatePresence mode="wait" initial={false}>
            <TransitionWrapper key={router.pathname}>
              <Component {...pageProps} />
            </TransitionWrapper>
          </AnimatePresence>
        </main>
        
        <Footer />
        
        {/* Scroll to Top button */}
        <ScrollToTop />
        
        {/* Service Worker Registration */}
        <ServiceWorkerRegister />
        
        {/* Install Prompt */}
        <InstallPrompt />
        
        {/* Capacitor Detector */}
        <CapacitorDetector />
      </div>
    </ThemeProvider>
  );
}

