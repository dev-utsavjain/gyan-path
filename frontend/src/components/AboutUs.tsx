import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlareHover from './GlareHover';
import BlurText from './BlurText';

export default function AboutUs() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-lg h-full">
            <img alt="GPT Skills Building" className="w-full h-full object-cover min-h-[400px]" src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800&h=600" />
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <span className="text-blue-800 font-bold text-sm tracking-widest uppercase">About Us</span>
            <BlurText 
              as="h2"
              text="Empowering Skills. Building Better Futures." 
              delay={100} 
              className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-2" 
            />
            <BlurText 
              as="p"
              text="GyaanPath Digital is a leading skill development and career guidance platform committed to creating brighter futures for students across India."
              delay={200}
              className="text-gray-600 leading-relaxed mt-2.5 mb-2.5"
            />
            <BlurText 
              as="p"
              text="Our mission is to provide quality education, practical skills, career support and real opportunities."
              delay={300}
              className="text-gray-600 leading-relaxed mb-4"
            />
            <div className="pt-4">
              <Link className="bg-blue-800 hover:bg-blue-900 text-white rounded-md font-semibold inline-block transition-colors cursor-target overflow-hidden" to="/about">
                <GlareHover className="px-8 py-3 flex items-center justify-center w-full h-full" glareSize={180}>
                  Read More <ArrowRight className="ml-2" size={18} />
                </GlareHover>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
