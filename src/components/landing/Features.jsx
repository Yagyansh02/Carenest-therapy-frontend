import { Video, Calendar, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const features = [
  {
    name: 'Secure Video Sessions',
    description: 'Connect with your therapist from the comfort of your home through our HIPAA-compliant video platform.',
    icon: Video,
  },
  {
    name: 'Easy Scheduling',
    description: 'Book appointments that fit your schedule with our real-time availability calendar.',
    icon: Calendar,
  },
  {
    name: 'Verified Specialists',
    description: 'Every therapist on Wellthy is licensed, vetted, and experienced in their field.',
    icon: Shield,
  },
  {
    name: 'Group Therapy',
    description: 'Join support groups led by professional therapists to share and learn from others.',
    icon: Users,
  },
];

export const Features = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="bg-white py-24 sm:py-32" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4 text-gray-800" style={{ fontFamily: 'serif' }}>Why Choose CareNest</h2>
          <p className="text-gray-700 text-lg">
            We provide the tools and support you need to prioritize your mental well-being.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#9ECAD6]/30">
                  <feature.icon className="h-8 w-8 text-[#748DAE]" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.name}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};