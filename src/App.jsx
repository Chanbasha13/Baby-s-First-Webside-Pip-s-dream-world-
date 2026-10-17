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
import { initStorybookTilt } from './utils/storybookTilt';

export default function App() {
  useEffect(() => {
    return initStorybookTilt();
  }, []);

  return (
    <PipPersonalityProvider>
      <div className="page-wrapper">
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
      </div>
    </PipPersonalityProvider>
  );
}
