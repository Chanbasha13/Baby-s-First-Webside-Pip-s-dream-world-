import React, { useEffect } from 'react';
import { PipPersonalityProvider } from './context/PipPersonalityContext';
import SparkleCursor from './components/SparkleCursor';
import Navbar from './components/Navbar';
import HeroSection from './sections/HeroSection';
import OriginStorySection from './sections/OriginStorySection';
import ConstellationAtlasSection from './sections/ConstellationAtlasSection';
import ProjectsSection from './sections/ProjectsSection';
import CatchDreamsGameSection from './sections/CatchDreamsGameSection';
import GuestbookSection from './sections/GuestbookSection';
import Footer from './components/Footer';
import BedtimeMusicPlayer from './components/BedtimeMusicPlayer';
import SecretDreamQuest from './components/SecretDreamQuest';
import PersistentCelestialBackground from './components/PersistentCelestialBackground';
import { initStorybookTilt } from './utils/storybookTilt';

export default function App() {
  useEffect(() => {
    // Ensure initial visit or refresh of the base URL '/' starts at top (Pip's hero / homepage)
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (!hash || hash === '#' || hash === '#dream-world') {
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
      } else {
        // If a visitor intentionally opened a URL containing a valid section hash, scroll to that section
        const targetId = hash.replace(/^#/, '');
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        }
      }
    }

    return initStorybookTilt();
  }, []);

  return (
    <PipPersonalityProvider>
      <div className="page-wrapper">
        <PersistentCelestialBackground />
        <SparkleCursor />
        <Navbar />
        <main className="main-content">
          <HeroSection />
          <OriginStorySection />
          <ConstellationAtlasSection />
          <ProjectsSection />
          <CatchDreamsGameSection />
          <GuestbookSection />
        </main>
        <Footer />
        <BedtimeMusicPlayer />
        <SecretDreamQuest />
      </div>
    </PipPersonalityProvider>
  );
}
