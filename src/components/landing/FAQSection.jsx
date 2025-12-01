import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const faqs = [
  {
    question: 'What is CareNest?',
    answer: 'CareNest is an online platform connecting you with qualified therapists and supervised psychology students for affordable mental health support.',
  },
  {
    question: 'Why is therapy so affordable here?',
    answer: 'We offer sessions with postgraduate psychology students who provide therapy at lower fees under the strict supervision of licensed experts.',
  },
  {
    question: 'Is student therapy safe and effective?',
    answer: 'Yes. Every student therapist is guided by a verified supervisor who reviews progress and ensures high quality and ethical standards.',
  },
  {
    question: 'How does the matching process work?',
    answer: 'You complete a simple assessment about your needs and goals, and our system matches you with therapists who specialize in those areas.',
  },
  {
    question: 'Is the entire process online?',
    answer: 'Yes. From finding a therapist to attending video sessions and tracking progress, everything happens on our secure online platform.',
  },
  {
    question: 'Can I choose a licensed professional instead?',
    answer: 'Absolutely. You have the freedom to choose between student therapists and licensed professionals based on your preference and budget.',
  },
];

export const FAQSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-[#F5CBCB]/20" ref={ref}>
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-800" style={{ fontFamily: 'serif' }}>
            Frequently Asked Questions
          </h2>
          <p className="text-gray-700">
            Everything you need to know about CareNest.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
