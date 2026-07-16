import { Helmet } from 'react-helmet-async';
import { ArrowRight, Trophy, Users, BookOpen, Target, CheckCircle2 } from 'lucide-react';
import GlareHover from '../components/GlareHover';
import BlurText from '../components/BlurText';

export default function AboutUsPage() {
  return (
    <div className="bg-gray-50 flex-grow">
      <Helmet>
        <title>About Us | GyaanPath Digital</title>
        <meta name="description" content="Learn about our mission at GyaanPath Digital to bridge the gap between education and employment in India with top-tier practical skill development." />
      </Helmet>
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlurText 
            as="h1"
            text="About GyaanPath Digital" 
            delay={100} 
            className="text-4xl md:text-5xl font-extrabold leading-tight mb-6" 
          />
          <BlurText 
            as="p"
            text="Empowering individuals to achieve their career goals through quality skill development."
            delay={200}
            className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto"
          />
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 space-y-6">
              <span className="text-orange-500 font-bold text-sm tracking-widest uppercase">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Bridging the Gap Between Education and Employment.</h2>
              <p className="text-gray-600 leading-relaxed">
                At GyaanPath Digital, our mission is to empower learners across India with the practical skills needed to thrive in today's competitive job market. We believe that quality education should be accessible, industry-relevant, and directly aligned with career opportunities.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Through our comprehensive programs, we aim to bridge the gap between academic learning and industry expectations, ensuring our students are job-ready from day one.
              </p>
              <ul className="space-y-3 mt-6">
                {[
                  "Industry-aligned curriculum",
                  "Expert mentorship and guidance",
                  "Practical, hands-on learning",
                  "Dedicated placement assistance"
                ].map((item, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckCircle2 className="text-green-500 mr-3 shrink-0" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop" 
                alt="Students learning together" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-bold text-sm tracking-widest uppercase">Our Values</span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">What Drives Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <BookOpen size={32} className="text-blue-600" />,
                title: "Excellence in Education",
                desc: "We deliver top-tier, industry-relevant curriculum designed by experts."
              },
              {
                icon: <Users size={32} className="text-blue-600" />,
                title: "Student Success",
                desc: "Your success is our priority. We provide dedicated support every step of the way."
              },
              {
                icon: <Target size={32} className="text-blue-600" />,
                title: "Practical Approach",
                desc: "We focus on hands-on learning and real-world application of skills."
              },
              {
                icon: <Trophy size={32} className="text-blue-600" />,
                title: "Continuous Growth",
                desc: "We continuously evolve our programs to match industry trends and demands."
              }
            ].map((value, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Join Us CTA */}
      <section className="py-20 bg-blue-900 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Accelerate Your Career?</h2>
          <p className="text-blue-100 mb-8 text-lg">Join thousands of students who have transformed their lives through GyaanPath Digital programs.</p>
          <a href="/#courses" className="bg-orange-500 hover:bg-orange-600 text-white rounded-md font-semibold inline-block transition-colors cursor-target overflow-hidden">
            <GlareHover className="px-8 py-4 flex items-center justify-center w-full h-full" glareSize={200}>
              Explore Our Courses <ArrowRight className="ml-2" size={20} />
            </GlareHover>
          </a>
        </div>
      </section>
    </div>
  );
}
