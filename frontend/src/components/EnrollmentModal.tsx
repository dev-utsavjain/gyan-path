import React, { useState } from 'react';
import { X, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import GlareHover from './GlareHover';
import { startPayment, type StudentDetails } from '../api/payment';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planDetails?: {
    planName: string;
    price: number;
    priceText: string;
  };
}

const EMPTY_FORM = {
  studentName: '',
  fatherName: '',
  age: '',
  mobile: '',
  email: '',
  qualification: '',
  address: '',
  coordinatorName: 'NA',
};

export default function EnrollmentModal({ isOpen, onClose, planDetails = { planName: 'GyaanPath Digital Career Development Program', price: 399, priceText: '₹399' } }: EnrollmentModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const update = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const closeAll = () => {
    setForm(EMPTY_FORM);
    setError(null);
    setPaying(false);
    setPaymentSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const details: StudentDetails = {
      course_name: planDetails.planName,
      amount: planDetails.price,
      student_name: form.studentName.trim(),
      father_name: form.fatherName.trim(),
      age: parseInt(form.age, 10) || 0,
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      qualification: form.qualification,
      address: form.address.trim(),
      coordinator_name: form.coordinatorName.trim() || 'NA',
    };

    setPaying(true);
    await startPayment({
      details,
      onSuccess: () => {
        setPaying(false);
        setPaymentSuccess(true);
        setTimeout(closeAll, 3500);
      },
      onFailure: (message) => {
        setPaying(false);
        setError(message);
      },
      onDismiss: () => {
        setPaying(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative my-auto md:my-8 m-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-xl font-bold text-blue-900">Student Details</h3>
            <p className="text-sm text-gray-500">Please fill out this form to enroll.</p>
          </div>
          <button onClick={closeAll} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {paymentSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle size={64} className="text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your enrollment is confirmed. Welcome to GyaanPath Digital.</p>
            </div>
          ) : (
          <form id="enrollment-form" className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={form.studentName} onChange={update('studentName')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter full name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name *</label>
                <input type="text" value={form.fatherName} onChange={update('fatherName')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter father's name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input type="number" min="10" max="100" value={form.age} onChange={update('age')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter age" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                <input type="tel" value={form.mobile} onChange={update('mobile')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter mobile number" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email ID</label>
                <input type="email" value={form.email} onChange={update('email')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="Enter email address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification *</label>
                <div className="relative">
                  <select value={form.qualification} onChange={update('qualification')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none bg-white" required>
                    <option value="" disabled>Select Qualification</option>
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea rows={2} value={form.address} onChange={update('address')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="Enter full address" required></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coordinator Name *</label>
              <input type="text" value={form.coordinatorName} onChange={update('coordinatorName')} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="If not available, fill NA" required />
              <p className="text-xs text-gray-500 mt-1">If not available fill NA</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Course Preference *</label>
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-start cursor-pointer">
                  <div className="flex items-center h-5">
                    <input type="checkbox" className="w-5 h-5 text-orange-500 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2 accent-orange-500" defaultChecked required />
                  </div>
                  <div className="ml-3">
                     <span className="block text-sm font-bold text-gray-900">{planDetails.planName}</span>
                     <span className="block text-xs text-gray-500 mt-0.5">Selected Program</span>
                  </div>
                </label>
                <label className="flex items-start opacity-50 cursor-not-allowed">
                  <div className="flex items-center h-5">
                    <input type="checkbox" className="w-5 h-5 text-orange-500 bg-white border-gray-300 rounded focus:ring-orange-500 accent-orange-500" disabled />
                  </div>
                  <div className="ml-3">
                     <span className="block text-sm font-bold text-gray-900">Advanced Professional Development</span>
                     <span className="block text-xs text-gray-500 mt-0.5">Coming Soon</span>
                  </div>
                </label>
              </div>
            </div>
          </form>
          )}
        </div>

        {!paymentSuccess && (
        <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10">
          <button
            type="submit"
            form="enrollment-form"
            disabled={paying}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-200 group block cursor-target overflow-hidden"
          >
            <GlareHover className="w-full py-3.5 px-4 flex items-center justify-center" glareSize={400}>
              {paying ? (
                <span className="relative z-10 flex items-center"><Loader2 size={20} className="animate-spin mr-2" /> Processing…</span>
              ) : (
                <>
                  <span className="relative z-10">Proceed to Pay {planDetails.priceText}</span>
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </GlareHover>
          </button>
        </div>
        )}
      </div>
    </div>
  );
}
