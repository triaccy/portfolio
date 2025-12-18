import React from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { projects } from "../data/projects";

interface ProjectDetailProps {
  project: typeof projects[0];
  onClose: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "circOut" }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Content Card */}
      <div className="relative w-full max-w-4xl h-full max-h-[90vh] bg-[#fffbf5] rounded-lg overflow-hidden shadow-2xl flex flex-col md:flex-row">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/50 rounded-full hover:bg-white transition-colors backdrop-blur-md text-stone-800"
        >
          <X size={24} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 h-64 md:h-full relative">
            <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover"
            />
             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
        </div>

        {/* Text Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-stone-50 text-stone-800 overflow-y-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
              <span className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-widest uppercase border border-stone-300 rounded-full text-stone-500">
                  {project.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-stone-900">
                  {project.title}
              </h1>
              <div className="w-12 h-1 bg-orange-300 mb-8" />
              <p className="text-lg leading-relaxed text-stone-600 mb-8">
                  {project.description}
              </p>
              
              <div className="flex gap-4">
                  <button className="px-6 py-3 bg-stone-900 text-white rounded-md font-medium hover:bg-stone-800 transition-colors">
                      View Case Study
                  </button>
              </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
