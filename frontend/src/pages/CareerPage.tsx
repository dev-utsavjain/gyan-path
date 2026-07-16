import { Helmet } from 'react-helmet-async';
import { Briefcase, Mail } from 'lucide-react';
import BlurText from '../components/BlurText';

export default function CareerPage() {
  const openings = [
    {
      id: 1,
      title: 'Legal Counsel / Law Expert',
      department: 'Legal & Compliance',
      type: 'Full-time',
      location: 'Remote / India',
      description: 'We are looking for an experienced legal professional to guide our educational policies, handle compliance, and provide expert advice on educational sector regulations.',
      requirements: [
        'Degree in Law (LLB/LLM) from a recognized university.',
        'Minimum 3 years of experience in corporate or educational law.',
        'Strong analytical and problem-solving skills.',
      ],
    },
    {
      id: 2,
      title: 'Medical Subject Matter Expert',
      department: 'Content Creation & Strategy',
      type: 'Full-time',
      location: 'Remote / India',
      description: 'Seeking a medical professional to develop curriculum, review content, and provide guidance for our medical exam preparatory courses.',
      requirements: [
        'Degree in Medicine (MBBS or equivalent).',
        'Passion for teaching and educational content development.',
        'Excellent written and verbal communication skills.',
      ],
    }
  ];

  return (
    <div className="bg-gray-50 flex-grow text-gray-900 min-h-screen flex flex-col antialiased">
      <Helmet>
        <title>Careers | Join GyaanPath Digital</title>
        <meta name="description" content="Explore current job openings at GyaanPath Digital. Build the future of education with a passionate team in India." />
      </Helmet>
      <main className="flex-grow w-full">
        {/* Header Section */}
        <section className="bg-blue-900 text-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <BlurText 
              as="h1"
              text="Join Our Team" 
              delay={100} 
              className="text-4xl md:text-5xl font-extrabold leading-tight mb-6" 
            />
            <BlurText 
              as="p"
              text="Build the future of education with GyaanPath Digital."
              delay={200}
              className="text-xl text-blue-100 max-w-3xl mx-auto mb-10"
            />
          </div>
        </section>

        {/* Openings Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Current Openings</h2>
            <div className="h-1 w-16 bg-orange-500 rounded mb-8 md:mx-0 mx-auto"></div>
            <p className="text-lg text-gray-600">
              We are always on the lookout for talented individuals. Explore our current open positions below.
            </p>
          </div>

          <div className="space-y-6">
            {openings.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">{job.department}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">{job.type}</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-full">{job.location}</span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <a href="mailto:hr@gyaanpathdigital.in" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-colors">
                        Apply Now
                      </a>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">About the Role</h4>
                    <p className="text-gray-600 mb-6">{job.description}</p>
                    
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h4>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact / Spontaneous Application */}
          <div className="mt-16 bg-blue-50 rounded-2xl p-8 text-center border border-blue-100">
            <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Don't see a perfect fit?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We are continually growing and eager to connect with passionate professionals. Send us your resume and let us know how you can contribute to our mission.
            </p>
            <a href="mailto:hr@gyaanpathdigital.in" className="inline-flex items-center text-blue-700 font-semibold hover:text-blue-800 transition-colors text-lg">
              <Mail className="mr-2" size={20} />
              hr@gyaanpathdigital.in
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
