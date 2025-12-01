import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, Heart, Shield, ArrowRight, Sparkles } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="pt-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#9ECAD6]/30 to-white py-32 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#9ECAD6]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F5CBCB]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 mb-6 shadow-sm">
                <Sparkles className="w-4 h-4 text-[#748DAE]" />
                <span className="text-sm font-medium text-gray-600">Revolutionizing Mental Health Care</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900" style={{ fontFamily: 'serif' }}>
                Bridging the Gap in
                <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#748DAE] to-[#9ECAD6]">Mental Wellness</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
                CareNest is an online therapy platform designed to make mental health support accessible, affordable, and personalized for everyone.
              </p>
              <div className="flex gap-4">
                <Link to="/register">
                  <button className="px-8 py-4 text-base font-medium text-white bg-[#748DAE] rounded-full hover:bg-[#748DAE]/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                    Start Your Journey
                  </button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="mt-12 lg:mt-0 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#748DAE] to-transparent rounded-[2rem] transform rotate-3 opacity-20" />
              <img
                src="https://images.unsplash.com/photo-1527689368864-3a821dbccc34?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                alt="Team collaboration"
                className="relative rounded-[2rem] shadow-2xl w-full object-cover h-[500px] border-4 border-white"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="py-32 bg-white relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900" 
              style={{ fontFamily: 'serif' }}
            >
              Why We Started CareNest
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 max-w-3xl mx-auto text-xl leading-relaxed"
            >
              We identified a critical gap in the mental health landscape. While demand for therapy is rising, accessibility remains a challenge.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-stretch">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-red-50 to-white p-10 rounded-3xl border border-red-100 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-6 text-red-500">
                <XIcon className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900">The Challenge</h3>
              <ul className="space-y-6">
                {[
                  "High consultation fees make therapy unaffordable.",
                  "Finding the right therapist is confusing and overwhelming.",
                  "Stigma and logistical barriers prevent seeking help."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                    <span className="text-gray-700 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#9ECAD6]/20 to-white p-10 rounded-3xl border border-[#9ECAD6]/30 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-[#9ECAD6]/30 rounded-2xl flex items-center justify-center mb-6 text-[#748DAE]">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold mb-6 text-gray-900">The Solution</h3>
              <ul className="space-y-6">
                {[
                  "Affordable sessions with supervised student therapists.",
                  "Personalized matching based on your specific needs.",
                  "Fully online platform for comfort and convenience."
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#9ECAD6]/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-[#748DAE]" />
                    </div>
                    <span className="text-gray-700 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Unique Model */}
      <section className="py-32 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
        
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900" style={{ fontFamily: 'serif' }}>
              Our Unique Ecosystem
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-xl">
              A supportive community built on trust, growth, and accessibility.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: "For Patients",
                desc: "Access affordable, high-quality therapy from home. Choose between student therapists or licensed professionals.",
                color: "text-[#748DAE]",
                bg: "bg-[#9ECAD6]/20"
              },
              {
                icon: Users,
                title: "For Students",
                desc: "Gain real-world experience and practice hours under the guidance of expert supervisors.",
                color: "text-rose-500",
                bg: "bg-rose-100"
              },
              {
                icon: Shield,
                title: "For Supervisors",
                desc: "Guide the next generation of therapists. Oversee sessions, ensure quality, and expand your impact.",
                color: "text-purple-600",
                bg: "bg-purple-100"
              }
            ].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-16 h-16 ${card.bg} rounded-2xl flex items-center justify-center mb-6 ${card.color} transform rotate-3`}>
                  <card.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{card.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#748DAE]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#748DAE] to-[#5A7293]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')] opacity-10" />
        </div>

        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-10 text-white/90 tracking-wide uppercase text-sm">Our Vision</h2>
            <p className="text-3xl lg:text-5xl font-bold leading-tight text-white mb-12 font-serif italic">
              "To break financial barriers to mental health care, support young therapists, and provide a global platform where help is just a click away."
            </p>
            <Link to="/register">
              <button className="group px-10 py-5 text-lg font-medium text-[#748DAE] bg-white rounded-full hover:bg-gray-50 transition-all shadow-2xl flex items-center gap-2 mx-auto">
                Join CareNest Today
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 18 18" />
  </svg>
);
