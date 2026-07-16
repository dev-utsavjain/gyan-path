import { Users, Tv, UserCheck, Briefcase, Award, Shield } from 'lucide-react';

export default function StatsBar() {
  return (
    <section className="bg-white border-y border-gray-200 py-6 relative z-20 -mt-8 mx-4 sm:mx-8 lg:mx-auto max-w-7xl rounded-xl shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center divide-x divide-gray-100">
          <div className="flex flex-col items-center justify-center px-2">
            <Users className="text-blue-800 mb-2" size={24} />
            <p className="font-bold text-gray-900">10,000+</p>
            <p className="text-xs text-gray-500">Students Enrolled</p>
          </div>
          <div className="flex flex-col items-center justify-center px-2">
            <Tv className="text-blue-800 mb-2" size={24} />
            <p className="font-bold text-gray-900">Daily Live</p>
            <p className="text-xs text-gray-500">Interactive Classes</p>
          </div>
          <div className="flex flex-col items-center justify-center px-2">
            <UserCheck className="text-blue-800 mb-2" size={24} />
            <p className="font-bold text-gray-900">Expert</p>
            <p className="text-xs text-gray-500">Trainers</p>
          </div>
          <div className="flex flex-col items-center justify-center px-2">
            <Briefcase className="text-blue-800 mb-2" size={24} />
            <p className="font-bold text-gray-900">Placement</p>
            <p className="text-xs text-gray-500">Support</p>
          </div>
          <div className="flex flex-col items-center justify-center px-2">
            <Award className="text-blue-800 mb-2" size={24} />
            <p className="font-bold text-gray-900">Certificate</p>
            <p className="text-xs text-gray-500">Included</p>
          </div>
          <div className="flex flex-col items-center justify-center px-2">
            <Shield className="text-blue-800 mb-2" size={24} />
            <p className="font-bold text-gray-900">Trusted by</p>
            <p className="text-xs text-gray-500">Students Across India</p>
          </div>
        </div>
      </div>
    </section>
  );
}
