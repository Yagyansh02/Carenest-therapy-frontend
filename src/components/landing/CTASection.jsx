import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section className="py-24 bg-[#748DAE] text-white" ref={ref}>
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: 'serif' }}>
            Start Your Affordable Journey
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Break financial barriers to mental health. Connect with a therapist who understands you today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <button className="px-8 py-4 text-base font-medium text-[#748DAE] bg-white rounded-full hover:bg-gray-50 transition-colors shadow-xl">
                Get Matched
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-8 py-4 text-base font-medium text-white bg-transparent border-2 border-white rounded-full hover:bg-white/20 transition-colors">
                Contact Us
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
