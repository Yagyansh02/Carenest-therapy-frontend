import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export const AboutSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-[#F5CBCB]/20" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-800" style={{ fontFamily: 'serif' }}>
              We Care About Your Life
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              At CareNest, we provide personalized mental health counseling with licensed therapists focused on your unique needs. Our team of experienced professionals is dedicated to helping you achieve mental wellness through evidence-based therapy approaches.
            </p>
            <button className="px-8 py-3 text-base font-medium text-white bg-[#748DAE] rounded-full hover:bg-[#748DAE]/90 transition-colors shadow-lg">
              Learn More
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 lg:mt-0"
          >
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Therapist session"
                className="rounded-2xl w-full h-64 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Group therapy"
                className="rounded-2xl w-full h-64 object-cover mt-8"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
