import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const faqs = [
  {
    question: 'What types of therapy do you offer?',
    answer: 'We offer individual therapy, couples counseling, family therapy, group sessions, and specialized treatment for anxiety, depression, trauma, and more.',
  },
  {
    question: 'How do I know if therapy is right for me?',
    answer: 'Therapy can benefit anyone seeking to improve their mental health, navigate life changes, or work through challenging emotions and situations.',
  },
  {
    question: 'Are sessions confidential?',
    answer: 'Yes, all sessions are completely confidential and conducted on HIPAA-compliant platforms to ensure your privacy and security.',
  },
  {
    question: 'How long does each session last?',
    answer: 'Standard therapy sessions typically last 50-60 minutes, though this can vary based on your specific needs and treatment plan.',
  },
  {
    question: 'Do you accept insurance?',
    answer: 'We accept most major insurance providers. Contact us to verify your coverage and discuss payment options.',
  },
  {
    question: 'Can I choose my therapist?',
    answer: 'Absolutely! You can browse our therapist profiles and select the professional who best fits your needs and preferences.',
  },
];

export const FAQSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-[#F5CBCB]/20" ref={ref}>
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-800" style={{ fontFamily: 'serif' }}>
            Frequently Asked
            <br />
            Questions
          </h2>
          <p className="text-gray-700">
            Find answers to common questions about our services and therapy process.
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
