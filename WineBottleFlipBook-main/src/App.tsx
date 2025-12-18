import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import { BookLamp } from "./components/BookLamp";
import { ProjectDetail } from "./components/ProjectDetail";
import { projects } from "./data/projects";

export default function App() {
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null);

  const handleProjectSelect = (project: typeof projects[0]) => {
    setSelectedProject(project);
  };

  const handleCloseProject = () => {
    setSelectedProject(null);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#f2f0ea] text-stone-800 font-sans selection:bg-orange-200/50">
      {/* Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Spotlight on the book */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-orange-100/40 blur-[120px] rounded-full opacity-60" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.05)_100%)]" />
      </div>

      {/* Header / Title - Only visible when book is closed */}
      <AnimatePresence>
        {!isBookOpen && (
          <div className="absolute top-10 left-0 right-0 z-10 flex flex-col items-center justify-center text-center pointer-events-none">
            <h2 className="text-2xl font-serif text-stone-700 opacity-80">
              Select a Story
            </h2>
          </div>
        )}
      </AnimatePresence>

      {/* Main 3D Scene Container */}
      <main className="w-full h-full flex items-center justify-center relative z-0">
          <BookLamp 
            isOpen={isBookOpen} 
            onToggle={() => setIsBookOpen(!isBookOpen)}
            onSelectProject={handleProjectSelect}
          />
      </main>

      {/* Project Detail Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetail 
            project={selectedProject} 
            onClose={handleCloseProject} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
