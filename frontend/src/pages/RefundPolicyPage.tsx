import React from 'react';
import { Helmet } from 'react-helmet-async';
import BlurText from '../components/BlurText';

export default function RefundPolicyPage() {
  return (
    <div className="bg-gray-50 flex-grow text-gray-900 min-h-screen flex flex-col antialiased">
      <Helmet>
        <title>Refund Policy | GyaanPath Digital</title>
        <meta name="description" content="GyaanPath Digital's refund policy - learn our rules and conditions for issuing course and service refunds." />
      </Helmet>
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-12">
          <BlurText 
            as="h1"
            text="Refund Policy" 
            delay={100} 
            className="text-4xl md:text-5xl font-extrabold text-blue-900 leading-tight mb-6" 
          />
          <p className="text-gray-600">Last updated: June 18, 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. General Refund Policy</h2>
            <p>
              At GyaanPath Digital, we want to ensure that you are 100% satisfied with your purchase. We stand behind the quality of our courses and services. However, if you are not satisfied, we offer a refund under the conditions described below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility for Refund</h2>
            <p className="mb-3">
              If you feel that the course or service does not meet your expectations, you may request a refund. We evaluate refund requests on a case-by-case basis. <strong>If the reason provided for the refund is reasonable and logical, we can process a 90% refund within 3 working days.</strong>
            </p>
            <p className="mb-3">
              A 10% deduction is applied to cover administrative and payment gateway processing fees.
            </p>
            <p>
              Please note that refunds are typically only considered if the request is made within 7 days of the original purchase date and if the course has not been substantially completed or downloaded.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How to Request a Refund</h2>
            <p className="mb-3">
              To request a refund, please follow these steps:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Send an email to <strong>info@gyaanpathdigital.in</strong> from your registered email address.</li>
              <li>Include your full name, transaction ID, and the exact name of the course or service purchased.</li>
              <li>Provide a detailed, logical, and reasonable explanation for why you are requesting a refund.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Processing Time</h2>
            <p>
              Once your refund request is received and reviewed, we will send you an email to notify you of the approval or rejection of your refund. If approved, the refund (90% of the original purchase amount) will be processed, and a credit will automatically be applied to your credit card or original method of payment within <strong>3 working days</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Non-Refundable Items</h2>
            <p>
              Certain items or services might be excluded from our refund policy, such as physical personalized print products once they have entered the production phase, or courses that have been 100% completed. This will be stated clearly at the time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Late or Missing Refunds</h2>
            <p>
              If you haven't received a refund within the specified 3 working days, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted. Next, contact your bank. There is often some processing time before a refund is posted. If you've done all of this and you still have not received your refund yet, please contact us at info@gyaanpathdigital.in.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
