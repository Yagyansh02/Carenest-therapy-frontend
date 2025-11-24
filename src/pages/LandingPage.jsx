import { Hero } from '../components/landing/Hero';
import { AboutSection } from '../components/landing/AboutSection';
import { ServicesGrid } from '../components/landing/ServicesGrid';
import { BenefitsSection } from '../components/landing/BenefitsSection';
import { StatsSection } from '../components/landing/StatsSection';
import { TherapistShowcase } from '../components/landing/TherapistShowcase';
import { Testimonials } from '../components/landing/Testimonials';
import { BlogSection } from '../components/landing/BlogSection';
import { FAQSection } from '../components/landing/FAQSection';
import { CTASection } from '../components/landing/CTASection';

export const LandingPage = () => {
  return (
    <div className="flex flex-col overflow-hidden">
      <Hero />
      <AboutSection />
      <ServicesGrid />
      <BenefitsSection />
      <StatsSection />
      <TherapistShowcase />
      <Testimonials />
      <BlogSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};