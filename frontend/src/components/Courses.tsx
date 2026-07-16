import { useEffect, useState, Fragment } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import GlareHover from './GlareHover';
import BlurText from './BlurText';
import { fetchCourses, type Course } from '../api/courses';
import { useSettings } from '../context/SettingsContext';

interface CoursesProps {
  onEnroll?: (planName: string, price: number, priceText: string) => void;
}

// Small flip card used by the Basic, Additional and Upcoming sections.
function FlipCard({
  course,
  comingSoon,
  onJoin,
}: {
  course: Course;
  comingSoon?: boolean;
  onJoin?: () => void;
}) {
  const detailBtn = comingSoon
    ? 'border-gray-500 text-gray-500'
    : 'border-orange-500 text-orange-500';
  return (
    <div className="relative group cursor-target h-full" tabIndex={0}>
      <div className="w-full h-full transition-transform duration-500 ease-in-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus:[transform:rotateY(180deg)] group-focus-within:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className="relative w-full h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col [backface-visibility:hidden]">
          <div className="relative w-full pb-[56.25%] overflow-hidden bg-gray-200">
            <img
              src={course.image_url}
              alt={course.title}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${comingSoon ? 'grayscale' : ''}`}
              loading="lazy"
            />
          </div>
          <div className="p-4 flex flex-col flex-grow items-center text-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm md:text-base mb-4 leading-tight">{course.title}</h3>
            <button className={`w-full border-2 ${detailBtn} rounded-lg py-2 font-semibold text-xs md:text-sm transition-colors cursor-target focus:outline-none bg-transparent`}>
              View Detail
            </button>
          </div>
        </div>

        {/* Back */}
        <div className={`absolute inset-0 w-full h-full ${comingSoon ? 'bg-gray-50 border-gray-200' : 'bg-orange-50 border-orange-200'} border rounded-xl overflow-y-auto flex flex-col items-center justify-start p-3 md:p-6 text-center shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] scrollbar-hide`}>
          <h3 className={`font-bold ${comingSoon ? 'text-gray-800' : 'text-orange-800'} text-xs md:text-base mb-1 md:mb-2 leading-tight flex-shrink-0`}>{course.title}</h3>
          <p className={`${comingSoon ? 'text-gray-600' : 'text-gray-700'} text-[10px] md:text-sm leading-snug md:leading-relaxed max-w-full md:max-w-[90%] flex-grow`}>
            {course.description}
          </p>
          {comingSoon ? (
            <button className="mt-2 md:mt-4 border-2 border-gray-500 bg-gray-500 text-white transition-colors rounded-lg py-1 md:py-2 px-2 md:px-4 w-full font-semibold text-[10px] md:text-sm cursor-not-allowed flex-shrink-0">
              Coming Soon
            </button>
          ) : (
            <button onClick={onJoin} className="mt-2 md:mt-4 border-2 border-orange-500 bg-orange-500 text-white hover:bg-orange-600 transition-colors rounded-lg py-1 md:py-2 px-2 md:px-4 w-full font-semibold text-[10px] md:text-sm cursor-target focus:outline-none flex-shrink-0">
              Join Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, accent = 'orange' }: { title: string; accent?: 'orange' | 'gray' }) {
  const bar = accent === 'gray' ? 'bg-gray-500' : 'bg-orange-500';
  const dot = accent === 'gray' ? 'border-gray-500' : 'border-orange-500';
  return (
    <div className="text-center mb-12 flex flex-col items-center">
      <BlurText as="h2" text={title} delay={100} className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4" />
      <div className={`w-24 h-1 ${bar} mx-auto rounded-full relative mb-8`}>
        <div className={`absolute w-3 h-3 bg-white border-2 ${dot} rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}></div>
      </div>
    </div>
  );
}

export default function Courses({ onEnroll }: CoursesProps) {
  const { get, num } = useSettings();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchCourses()
      .then((list) => {
        if (alive) setCourses(list);
      })
      .catch(() => {
        if (alive) setError('Could not load courses. Please refresh the page.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const byCat = (cat: Course['category']) => courses.filter((c) => c.category === cat);
  const basic = byCat('basic');
  const additional = byCat('additional_support');
  const premium = byCat('premium');
  const upcoming = byCat('upcoming');

  const basicName = get('plan_basic_name');
  const basicPrice = num('plan_basic_price');
  const additionalName = get('plan_additional_name');
  const additionalPrice = num('plan_additional_price');
  const upcomingPrice = num('plan_upcoming_price');

  return (
    <section id="courses" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-24 text-center text-gray-400">
            <Loader2 size={32} className="animate-spin mx-auto" />
          </div>
        ) : error ? (
          <div className="py-24 text-center text-gray-500">{error}</div>
        ) : (
          <>
            {/* Basic Plan */}
            {basic.length > 0 && (
              <>
                <SectionHeading title="Basic Plan" />
                <div className="border border-gray-200 rounded-3xl p-4 md:p-10 bg-white shadow-sm">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 [perspective:1000px]">
                    {basic.map((course) => (
                      <Fragment key={course.id}>
                        <FlipCard course={course} onJoin={() => onEnroll?.(basicName, basicPrice, `₹${basicPrice}`)} />
                      </Fragment>
                    ))}
                  </div>
                  <div className="mt-12 pt-10 border-t border-gray-100 text-center max-w-3xl mx-auto flex flex-col items-center">
                    <BlurText as="p" text={get('plan_basic_blurb')} delay={200} className="text-gray-700 text-lg md:text-xl font-medium mb-8 leading-relaxed" />
                    <button onClick={() => onEnroll?.(basicName, basicPrice, `₹${basicPrice}`)} className="block w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg transition-colors cursor-target overflow-hidden shadow-lg shadow-orange-200">
                      <GlareHover className="px-12 py-4 flex items-center justify-center w-full h-full" glareSize={250}>
                        Get All Access for ₹{basicPrice}
                      </GlareHover>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Additional Support */}
            {additional.length > 0 && (
              <>
                <div className="mt-20">
                  <SectionHeading title="Additional Support" />
                </div>
                <div className="border border-gray-200 rounded-3xl p-4 md:p-10 bg-white shadow-sm">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 [perspective:1000px]">
                    {additional.map((course) => (
                      <Fragment key={course.id}>
                        <FlipCard course={course} onJoin={() => onEnroll?.(additionalName, additionalPrice, `₹${additionalPrice}`)} />
                      </Fragment>
                    ))}
                  </div>
                  <div className="mt-12 pt-10 border-t border-gray-100 text-center max-w-3xl mx-auto flex flex-col items-center">
                    <BlurText as="p" text={get('plan_additional_blurb')} delay={200} className="text-gray-700 text-lg md:text-xl font-medium mb-8 leading-relaxed" />
                    <button onClick={() => onEnroll?.(additionalName, additionalPrice, `₹${additionalPrice}`)} className="block w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg transition-colors cursor-target overflow-hidden shadow-lg shadow-orange-200">
                      <GlareHover className="px-12 py-4 flex items-center justify-center w-full h-full" glareSize={250}>
                        Buy for ₹{additionalPrice} Only
                      </GlareHover>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Premium Special Courses */}
            {premium.length > 0 && (
              <>
                <div className="mt-20">
                  <SectionHeading title="Premium Special Courses" />
                </div>
                <div className="border border-gray-200 rounded-3xl p-6 md:p-10 bg-white shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    {premium.map((course) => (
                      <div key={course.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-shadow hover:shadow-xl flex flex-col cursor-target group">
                        <div className="relative w-full pb-[56.25%] overflow-hidden bg-gray-200">
                          <img src={course.image_url} alt={course.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col flex-grow">
                          <h2 className="font-bold text-gray-900 text-2xl mb-4">{course.title}</h2>
                          <p className="text-gray-600 leading-relaxed mb-6">{course.description}</p>
                          <ul className="space-y-3 mb-8 flex-grow">
                            {(course.features || []).map((feature, idx) => (
                              <li key={idx} className="flex items-start text-gray-700">
                                <CheckCircle className="text-orange-500 mt-1 mr-3 flex-shrink-0" size={18} />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <button onClick={() => onEnroll?.(course.title, course.price, `₹${course.price}`)} className="w-full bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl font-bold text-lg transition-colors cursor-target overflow-hidden focus:outline-none">
                            <div className="px-6 py-3.5 flex items-center justify-center w-full h-full">
                              Buy for ₹{course.price} Only
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Upcoming Courses */}
            {upcoming.length > 0 && (
              <>
                <div className="mt-20">
                  <SectionHeading title="Upcoming Courses" accent="gray" />
                </div>
                <div className="border border-gray-200 rounded-3xl p-4 md:p-10 bg-white shadow-sm">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 [perspective:1000px]">
                    {upcoming.map((course) => (
                      <Fragment key={course.id}>
                        <FlipCard course={course} comingSoon />
                      </Fragment>
                    ))}
                  </div>
                  <div className="mt-12 pt-10 border-t border-gray-100 text-center max-w-3xl mx-auto flex flex-col items-center">
                    <BlurText as="p" text={get('plan_upcoming_blurb')} delay={200} className="text-gray-700 text-lg md:text-xl font-medium mb-8 leading-relaxed" />
                    <button className="block w-full sm:w-auto bg-gray-500 text-white rounded-full font-bold text-lg transition-colors overflow-hidden shadow-lg shadow-gray-200 cursor-not-allowed">
                      <div className="px-12 py-4 flex items-center justify-center w-full h-full">
                        Will be available for <span className="ml-2 blur-md">₹{upcomingPrice}</span>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
