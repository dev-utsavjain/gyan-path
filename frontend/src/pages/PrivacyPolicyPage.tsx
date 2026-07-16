import React from 'react';
import { Helmet } from 'react-helmet-async';
import BlurText from '../components/BlurText';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 flex-grow text-gray-900 min-h-screen flex flex-col antialiased">
      <Helmet>
        <title>Privacy Policy | GyaanPath Digital</title>
        <meta name="description" content="Read the privacy policy of GyaanPath Digital to learn how we protect your personal information and rights." />
      </Helmet>
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <BlurText 
            as="h1"
            text="Privacy Policy" 
            delay={100} 
            className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight mb-6" 
          />
          <p className="text-gray-600">Last updated: June 18, 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Welcome to GyaanPath Digital. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us at info@gyaanpathdigital.in.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="mb-3">
              We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, or otherwise when you contact us. The personal information that we collect depends on the context of your interactions with us and the website, but it may include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Names, phone numbers, email addresses, and contact preferences.</li>
              <li>Payment details necessary to process your payments if you make purchases.</li>
              <li>Credentials like passwords for account authentication.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="mb-3">
              We use personal information collected via our website for a variety of business purposes described below:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To facilitate account creation and logon process.</li>
              <li>To fulfill and manage your orders and enrollments.</li>
              <li>To send you marketing and promotional communications.</li>
              <li>To respond to user inquiries and offer support.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing Your Information</h2>
            <p>
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Security of Your Information</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our website is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
            <p>
              If you have questions or comments about this notice, you may email us at <strong>info@gyaanpathdigital.in</strong> or by post to our office address.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
