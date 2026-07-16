import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Phone, MessageCircle, Mail, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import BlurText from './BlurText';
import { submitContact } from '../api/contact';
import { ApiError } from '../api/client';
import { useSettings } from '../context/SettingsContext';

const EMPTY = { name: '', email: '', phone: '', message: '' };

export default function ContactUs() {
  const { get } = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof EMPTY) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.message.trim()) {
      setError('Please enter your name and a message.');
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      setError('Please provide an email or phone number so we can reach you.');
      return;
    }

    setSending(true);
    try {
      await submitContact({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim(),
      });
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-12 flex flex-col items-center">
          <span className="text-blue-800 font-bold text-sm tracking-widest uppercase">Contact Us</span>
          <BlurText as="h2" text="Get in Touch" delay={100} className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4" />
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full relative">
            <div className="absolute w-3 h-3 bg-white border-2 border-orange-500 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
            <p className="text-gray-600 mb-8 max-w-md">
              Have questions or need assistance? Reach out to us through any of the channels below. Our team is always ready to help you on your learning journey.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {/* Call Us */}
              <a href={`tel:${get('contact_phone_raw')}`} className="flex items-center p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-blue-500 hover:shadow-md transition-all text-left">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <Phone className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Call Us</p>
                  <p className="font-bold text-gray-900">{get('contact_phone')}</p>
                </div>
              </a>
              {/* WhatsApp */}
              <a href={`https://wa.me/${get('contact_phone_raw')}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-green-500 hover:shadow-md transition-all text-left">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <MessageCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">WhatsApp</p>
                  <p className="font-bold text-gray-900">{get('contact_phone')}</p>
                </div>
              </a>
              {/* Email */}
              <a href={`mailto:${get('contact_email')}`} className="flex items-center p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-blue-500 hover:shadow-md transition-all text-left">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <Mail className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Email Us</p>
                  <p className="font-bold text-gray-900 text-[13px] sm:text-sm break-all">{get('contact_email')}</p>
                </div>
              </a>
              {/* Office */}
              <div className="flex items-center p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-blue-500 hover:shadow-md transition-all text-left">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <MapPin className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Our Office</p>
                  <p className="font-bold text-gray-900 text-sm">{get('contact_address')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl shadow-blue-900/5">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            {sent ? (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <CheckCircle size={56} className="text-green-500 mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h4>
                <p className="text-gray-600 mb-6">Thank you for reaching out. Our team will get back to you soon.</p>
                <button onClick={() => setSent(false)} className="text-blue-600 font-semibold hover:text-blue-700">Send another message</button>
              </div>
            ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" id="name" value={form.name} onChange={update('name')} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="John Doe" required />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" id="email" value={form.email} onChange={update('email')} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="john@example.com" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" id="phone" value={form.phone} onChange={update('phone')} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea id="message" rows={4} value={form.message} onChange={update('message')} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" disabled={sending} className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-lg transition-colors shadow-md mt-2 flex justify-center items-center">
                {sending ? <><Loader2 size={20} className="animate-spin mr-2" /> Sending…</> : 'Send Message'}
              </button>
            </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
