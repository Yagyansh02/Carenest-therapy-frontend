import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';

const therapists = [
  {
    name: 'Dr. Sarah Johnson',
    specialty: 'Clinical Psychologist',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    experience: '12 years',
  },
  {
    name: 'Dr. Michael Chen',
    specialty: 'Marriage Counselor',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    experience: '10 years',
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialty: 'Child Psychologist',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    experience: '8 years',
  },
  {
    name: 'Dr. James Williams',
    specialty: 'Anxiety Specialist',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    experience: '15 years',
  },
];

export const TherapistShowcase = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-[#F5CBCB]/20" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-800" style={{ fontFamily: 'serif' }}>
            Meet Our Therapists,
            <br />
            You're in Good Hands
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Our team of licensed professionals brings years of experience and compassion to help you on your mental health journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {therapists.map((therapist, index) => (
            <motion.div
              key={therapist.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow mb-4">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-1">{therapist.name}</h3>
                <p className="text-gray-600 mb-1">{therapist.specialty}</p>
                <p className="text-sm text-gray-500">{therapist.experience} experience</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/therapists">
            <button className="px-8 py-3 text-base font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors">
              View All Therapists
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
