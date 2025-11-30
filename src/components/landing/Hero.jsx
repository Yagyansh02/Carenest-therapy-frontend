import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-[#9ECAD6]/20 pt-32 pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:pr-8 mb-12 lg:mb-0"
          >
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6 text-gray-800" style={{ fontFamily: 'serif' }}>
              Accessible, Affordable,
              <br />
              <span className="italic text-[#748DAE]">Personalized Therapy</span>
            </h1>
            <p className="text-lg text-gray-700 leading-relaxed mb-8 max-w-xl">
              Connect with qualified therapists and supervised psychology students. We make mental health support accessible to everyone with our low-fee model and personalized matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <button className="px-8 py-4 text-base font-medium text-white bg-[#748DAE] rounded-full hover:bg-[#748DAE]/90 transition-colors shadow-lg">
                  Find Your Match
                </button>
              </Link>
              <Link to="/therapists">
                <button className="px-8 py-4 text-base font-medium text-[#748DAE] bg-white border-2 border-[#748DAE] rounded-full hover:bg-[#9ECAD6]/10 transition-colors">
                  View Therapists
                </button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                className="w-full h-auto object-cover"
                src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Woman relaxing peacefully"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};