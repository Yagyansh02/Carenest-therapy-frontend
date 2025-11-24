import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';

const posts = [
  {
    title: 'Understanding Anxiety and How to Manage It',
    excerpt: 'Learn practical strategies to cope with anxiety in your daily life.',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: 'Nov 15, 2025',
    category: 'Mental Health',
  },
  {
    title: 'The Importance of Self-Care in Mental Wellness',
    excerpt: 'Discover why prioritizing yourself is essential for mental health.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: 'Nov 10, 2025',
    category: 'Wellness',
  },
  {
    title: 'How Therapy Can Transform Your Life',
    excerpt: 'Real stories from clients who found healing through therapy.',
    image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    date: 'Nov 5, 2025',
    category: 'Therapy',
  },
];

export const BlogSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="py-24 bg-[#9ECAD6]/20" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-800" style={{ fontFamily: 'serif' }}>
            Stay Updated with Our
            <br />
            Latest Insights
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            Explore our blog for expert advice, mental health tips, and inspiring stories from our community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {posts.map((post, index) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-shadow mb-4">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-medium text-white bg-gray-900 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-2">{post.date}</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-gray-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <Link to="/blog" className="text-gray-900 font-medium hover:underline">
                Read More →
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/blog">
            <button className="px-8 py-4 text-base font-medium text-white bg-[#748DAE] rounded-full hover:bg-[#748DAE]/90 transition-colors shadow-lg">
              View All Articles
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};
