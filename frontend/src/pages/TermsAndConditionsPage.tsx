import React from 'react';
import { Helmet } from 'react-helmet-async';
import BlurText from '../components/BlurText';

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-gray-50 flex-grow text-gray-900 min-h-screen flex flex-col antialiased">
      <Helmet>
        <title>Terms & Conditions | GyaanPath Digital</title>
        <meta name="description" content="Agreement to terms, conditions, and intellectual property limits for using GyaanPath Digital." />
      </Helmet>
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <BlurText 
            as="h1"
            text="Terms & Conditions" 
            delay={100} 
            className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight mb-6" 
          />
          <p className="text-gray-600">Last updated: June 18, 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using GyaanPath Digital, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Services</h2>
            <p className="mb-3">
              You agree to use our services only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must not use our services to distribute any harmful or malicious content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Intellectual Property</h2>
            <p>
              The content, organization, graphics, design, compilation, and other matters related to our website and courses are protected under applicable copyrights, trademarks, and other proprietary rights. The copying, redistribution, use or publication by you of any such matters or any part of the website is strictly prohibited without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Course Content and Access</h2>
            <p>
              We strive to provide high-quality educational content, but we do not warrant that the content will always be accurate, complete, or current. We reserve the right to modify, suspend, or discontinue any course or service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
            <p>
              In no event shall GyaanPath Digital, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. It is your responsibility to check these Terms periodically for changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at <strong>info@gyaanpathdigital.in</strong>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
