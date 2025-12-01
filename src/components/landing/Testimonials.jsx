import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const testimonials = [
  {
    content: "I always wanted therapy but couldn't afford it. CareNest's student therapist program made it possible for me to get help.",
    author: "Sarah Johnson",
    role: "Client",
    rating: 5,
  },
  {
    content: "As a supervisor, I love seeing young therapists grow. CareNest provides a structured environment for them to learn and help others.",
    author: "Dr. Michael Chen",
    role: "Supervisor",
    rating: 5,
  },
  {
    content: "The matching process was spot on. I found a therapist who really understands my cultural background and needs.",
    author: "Emily Rodriguez",
    role: "Client",
    rating: 5,
  }
];

export const Testimonials = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="bg-white py-24" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'serif' }}>
            Community Stories
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from clients and professionals in our ecosystem.
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-[#9ECAD6]"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">
                "{testimonial.content}"
              </p>
              <div className="border-t border-gray-200 pt-6">
                <p className="text-base font-bold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};