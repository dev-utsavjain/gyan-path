import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, MessageCircle, Lock, Video, Bell, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface PurchaseState {
  studentName?: string;
  courseName?: string;
}

export default function ThankYouPage() {
  const { get } = useSettings();
  // Set by EnrollmentModal after a verified payment. Absent when the page is
  // opened directly, so every use of it is optional.
  const state = (useLocation().state || {}) as PurchaseState;
  const groupLink = get('whatsapp_group_link');

  return (
    <div className="bg-gray-50 py-12 sm:py-16">
      <Helmet>
        <title>Thank You | GyaanPath Digital</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Confirmation */}
          <div className="px-6 sm:px-10 pt-10 pb-8 text-center border-b border-gray-100">
            <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-900">
              Payment Successful{state.studentName ? `, ${state.studentName}` : ''}!
            </h1>
            <p className="text-gray-600 mt-2">
              {state.courseName
                ? <>Your enrollment in <span className="font-semibold text-gray-800">{state.courseName}</span> is confirmed.</>
                : 'Your enrollment is confirmed.'}
              {' '}Welcome to GyaanPath Digital.
            </p>
          </div>

          {/* The one remaining step */}
          <div className="px-6 sm:px-10 py-8">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <MessageCircle size={28} className="text-green-600 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    One important step left — join our WhatsApp group
                  </h2>
                  <p className="text-sm text-gray-700 mt-1">
                    Your classes run through this group. Please join now so you don't miss anything.
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <Video size={18} className="text-green-600 shrink-0 mt-0.5" />
                  <span><strong>Class links are shared only in the group.</strong> Every live session link is posted there before the class begins.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <Bell size={18} className="text-green-600 shrink-0 mt-0.5" />
                  <span><strong>All important updates go there too</strong> — timetable changes, study material, and announcements.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-gray-700">
                  <Lock size={18} className="text-green-600 shrink-0 mt-0.5" />
                  <span><strong>The group is private</strong> and only for enrolled students. This link is your access — join right now, while you have it.</span>
                </li>
              </ul>

              {groupLink ? (
                <a
                  href={groupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl py-4 px-6 flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 text-base sm:text-lg cursor-target"
                >
                  <MessageCircle size={22} />
                  Join WhatsApp Group
                  <ArrowRight size={20} />
                </a>
              ) : (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  The group link isn't available right now — please contact us on{' '}
                  <a className="font-semibold underline" href={`tel:${get('contact_phone_raw')}`}>{get('contact_phone')}</a>{' '}
                  and we'll add you.
                </p>
              )}

              <p className="text-xs text-gray-500 mt-3 text-center">
                Can't join right now? Save this page — or call us on{' '}
                <a className="font-semibold text-gray-700" href={`tel:${get('contact_phone_raw')}`}>{get('contact_phone')}</a>.
              </p>
            </div>

            <div className="mt-6 text-sm text-gray-600 text-center">
              A confirmation email has been sent to you if you provided an email address.
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                Back to Home
              </Link>
              <Link
                to="/gallery"
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-center"
              >
                See our Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
