import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import BlurText from './BlurText';
import GlareHover from './GlareHover';
import GradientText from './GradientText';
import { useSettings } from '../context/SettingsContext';

export default function Hero({ onEnroll }: { onEnroll?: () => void }) {
  const { get } = useSettings();

  return (
    <section className="hero-bg pt-16 pb-20 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:gap-16">
          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              <GradientText
                colors={['#1e3a8a', '#60a5fa', '#1e3a8a']}
                animationSpeed={6}
                showBorder={false}
                className="!m-0 !justify-start !block text-left"
              >
                {get('hero_title')}
              </GradientText>
            </h1>
            <BlurText
              as="p"
              text={get('hero_subtitle')}
              delay={400}
              animateBy="words"
              direction="top"
              className="text-lg md:text-xl text-gray-600 leading-relaxed"
            />
            <div className="flex items-center gap-6 pt-2">
              <a className="inline-block bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg transition-colors shadow-lg shadow-orange-200 cursor-target overflow-hidden" href="#courses">
                <GlareHover className="px-8 py-4 flex items-center justify-center w-full h-full" glareSize={250}>
                  See Courses <ArrowRight size={20} className="ml-2" />
                </GlareHover>
              </a>
            </div>
          </div>
          {/* Hero Image */}
          <motion.div 
            className="relative hidden lg:block w-full cursor-target"
            animate={{ y: [-10, 15, -10] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          >
            <img alt="Student learning with GyaanPath Digital" className="w-full h-auto object-contain rounded-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJSmXGZeC6atEzTaWtno3M0xpbORjKXY9l-9lyOaPkdpRbPiinyohu0siRpA52Vg3tZKEtRixqjVHnoZm4Vq82yBqzk9yeLe9E-_ri64WSzgg3adYEXBobxMAfY_ajTebrEjWANMFFIbdi-GrpfK844xXM0wDP9Mx40W2e8GZvfkF7chNpcwd4aqZnuwUUExuYDJef4eAkHSf-g_tY6wOUo0war61hAv3YDEu96Hskmqh_ezbNh2vd4Culm6LwVXQJ_JoNEQ4RkwbX" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
