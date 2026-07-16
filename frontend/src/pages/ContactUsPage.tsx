import { Helmet } from 'react-helmet-async';
import ContactUs from '../components/ContactUs';
import BlurText from '../components/BlurText';

export default function ContactUsPage() {
  return (
    <div className="bg-gray-50 flex-grow">
      <Helmet>
        <title>Contact Us | GyaanPath Digital</title>
        <meta name="description" content="Get in touch with the GyaanPath Digital team. Ask questions about our programs, custom printing services, scaling options, and more." />
      </Helmet>
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlurText 
            as="h1"
            text="Contact Us" 
            delay={100} 
            className="text-4xl md:text-5xl font-extrabold leading-tight mb-6" 
          />
          <BlurText 
            as="p"
            text="We are here to help and answer any questions you might have. We look forward to hearing from you."
            delay={200}
            className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto"
          />
        </div>
      </section>

      <ContactUs />
    </div>
  );
}
