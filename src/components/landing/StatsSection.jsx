import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect, useState } from 'react';

const stats = [
  { number: 12, suffix: '+', label: 'Years Experience' },
  { number: 34, suffix: '+', label: 'Expert Therapists' },
  { number: 5, suffix: 'K+', label: 'Happy Clients' },
];

export const StatsSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    if (inView) {
      stats.forEach((stat, index) => {
        let current = 0;
        const increment = stat.number / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= stat.number) {
            setCounts((prev) => {
              const newCounts = [...prev];
              newCounts[index] = stat.number;
              return newCounts;
            });
            clearInterval(timer);
          } else {
            setCounts((prev) => {
              const newCounts = [...prev];
              newCounts[index] = Math.floor(current);
              return newCounts;
            });
          }
        }, 30);
      });
    }
  }, [inView]);

  return (
    <section className="py-24 bg-[#748DAE] text-white" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'serif' }}>
            Our Holistic Healing Approach to
            <br />
            Mental Well-Being
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <div className="text-6xl font-bold mb-4" style={{ fontFamily: 'serif' }}>
                {counts[index]}
                {stat.suffix}
              </div>
              <div className="text-xl text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
