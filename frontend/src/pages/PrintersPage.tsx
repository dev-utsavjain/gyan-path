import React from 'react';
import { Helmet } from 'react-helmet-async';

const products = [
  {
    id: 1,
    title: 'Custom T-Shirts',
    description: 'Premium quality cotton tees with vibrant, long-lasting prints. Perfect for teams, events, or personal style.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLs8gDu7cYpHoO9QTRpXI5UV6Cn1ovTS8oYeCfWHmM3TnV8hPmKkrqsyF1xQDiTPTpeGHjPeJGYCKxdfX8I5Ta0fSoKPzFc9ZY9N3VAQo8Bs6wBN4N-CAtXROdnPW9mA20V5kdnuTOJEL__-i7tW70M6JZR00cfEyn4oGxpaV8Pb05IcE2wIwAYpyC8k9fb_VQwbSO5OLOoscu4f_YnUL-NWohWl4Hfcc1dTrQ7ogrxKg4LnZSWOeI_EVQg',
    featured: true,
  },
  {
    id: 2,
    title: 'Classic Photo Frames',
    description: 'Preserve memories elegantly.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLttrClC63a6pvmb3swbBoOSbfF2Imh-5ex-o0mrhc9SJsHDcYbKCH94HgJo5YmxeHvPiYDzOeekkSdTfl_aHWk1t3oy5DAnAvN2-A0y0s1PHI4PT7mIX1JU1LVwWJxvEcZJwXhGk10k5fagl9hVfgzg0GyFSqSxaPkKTCm0IiPSjXdXwXAD-42y_FhPxCPd_XwS2ZbAfATTNEo6UO9HVdrfjP-oLHTvpH1nAVl9-z7HICUBzUiH50uh_g',
  },
  {
    id: 3,
    title: 'Premium Business Cards',
    description: 'Make a lasting first impression.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLubuti-BerL0Z8-oJsOaVHSV-hRev82NFVdvLBl7pCNdfZeZO1asCCEORBus1OWs8aQo-AXrO7NCiwXw58oQcpRSQSmajCIzoMlh57sczQK7YaNiTYav88Gkkp5B4GIds7jmE5kCCPZfPv8rn7uHdfQ5hxaeWcHmrf0I7UL0g8eqrD2OmkLyIPB4GllEF-hRA-EcJN1zByLZZAr97CDdJsp7vKvq6aTlo9dg3zXtbUuhq4NW4rFUnA5Lw',
  },
  {
    id: 4,
    title: 'Personalized Photo Mugs',
    description: 'Perfect for home or office gifting.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLu5EhbuKEM72gPNN05WMqrcfxz5cDetMTCBy10GgvCcsG4djADn0MUKAe7vKRG30CFIswoTn_BdSbqxWHG3giczFwtHRKbHcvbH_78c04kOuZ3rbpibZoCJz2mu2n53q1Lhm75MRF6EpSoO-imCyqx23g6NeEBCMb2TO0Tq174WNVh8d3NN9CRnZcaRgLTY7dNVoKefVy0nYchtQOPDXyaZSjxVZHrUHOOFGLViXDN0ljqQbh8rFPxVdT4',
  },
  {
    id: 5,
    title: 'Corporate Booklets',
    description: 'Professional brochures & catalogs.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLsVqoclHGfIN1SftBzKZN1ur2pg50jyCYLDvvnFRYkeOkXkhyCo456WcDCF25kLPXSSuIzH0mgHQBFxgQdjGZgHTkEkDt-iRVn8vej7sViF39gpIMCh3emiFogz7LOcVVEzRncIlXLG0iYpNjapfAxvPz5_-uRWk6VXr5Z76REGZzWFvqthlyVZyRzrwyeFQKJcfewSg1jXS7tHzWPQoqzT51pZw_OmotDFGrlMDz3LmUjA7KIme9QS6O8',
  },
  {
    id: 6,
    title: 'Eco-Friendly Tote Bags',
    description: 'Sustainable, durable, and stylish. Customize with your artwork or logo for events or everyday use.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLsmlccgF1Lkba8MmRypKVrjLvfreIxdH5RgMlGo9A_Vy5NFhZEV8yQle0IzKsPqHqL0Yudn3FIzE64CbwGRQBIt4ER0ePXATQUk6ri1R8VQqdXJd8f-2HMTznVW9L0ZrFVOiAmmTHQIE4aHUfJGnmwDqRuzeyU61Ksi960cGVm0D4mFN7T3ekOkJperMRhQEA21ttIAMmfRgFYzXPcNwavXbh0MElQuuq2ZenLHc1f4WusV5oSVoogLC1E',
    featured: true,
    reverse: true,
  },
  {
    id: 7,
    title: 'Custom Lanyards',
    description: 'Essential for ID cards & events.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvhnGiW1rXIzo-XbBX3Okz9_Tm-cVO_Tgd958FiwmXs7RxErv6gcvMwJ7NoCeuNFL0Dq71ZJu1-usBhJwEbdM7HOTWC5Iz26ZejamjW-XaWYx88TnplMmrvy7Eggul80SgRkX1DB98kWQZXZ4rX7dHLWxmIhW-7gIComu7HYwuf6wki6DZRvy1VDHGfv-rvs6XwiUNtK4H_bU3Dw50UONLntBKnu2m2JKclHx24QoUa8LBOfkg8HpQiKUg',
  },
  {
    id: 8,
    title: 'Die-Cut Stickers',
    description: 'Vibrant labels for packaging.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLsGIIOR-rsVRH5nY2WX7f7wpe3LXUQH6l7v10mkxzTW3YR8_nOqMDNfoGJEqNc3n6t71SnZvdjTu-YHL_WET5BlNxVsYLbcHAASekk4t6fz4Y6TUJig6obS9iVc80rWcf6pdfDKgBgrRLX2QFjuKHu9EW-YAVi2GCArIqVNsyBoelUYiyEsZLCRsT4YNMau3K8DuM5BG9gBXzJISX7_uJyytoOEdhITmXnyT0dEM5t-DHrl25PWq59S8Ds',
  },
  {
    id: 9,
    title: 'Sports Jerseys',
    description: 'Breathable, personalized team wear.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLu4Ob0kC1BL25tMayS9j-F-keKa3Z9m6ELCv44hyUP46yfVVq_litY6DW_lPHjhasvx3-Y8HZiwDa4uEkEsWDF-CNgHOst1BV3g6aNukThZH6pVyulbTUspgvLjjTchlPxjQF9yNDf6yHifIrG9wdlQYKxtKA70pJzJ3qp-uXdEpPU_vVXTEhmXdDB4gb7a3YTy7n_vS4Vwz2mAv1u_N6ix10vdlpZ26FWyygPWWUvdoLWZotnx_oHAbRs',
  },
  {
    id: 10,
    title: 'Engraved Pens',
    description: 'Premium corporate gifting.',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtERvmd1q5IcvaUWk4ptZg7ACdZRK2YXDTFdNpXYij96fomRuiJtpeZ-AgBzkc9g9_b9dCVCt-b5fAxrzax3g_PrWJuD27-Os1GdUQP6wRO_vwbk29yvDPOLBN6WACYCsC8WfgVNtRSwRTYLD5Sy-jsmDSTA7RTzUwLqozVIP-BakcMi1Xix8J2WueeQVYHjDicNCoK1-jqPlxTdz4RJcIW4T-htHmxQLauFAamvl8hZNXeaGWPNEmJNQ',
  }
];

export default function PrintersPage() {
  return (
    <div className="bg-gray-50 flex-grow text-gray-900 min-h-screen flex flex-col antialiased">
      <Helmet>
        <title>Custom Prints & Branding | Govind Printer's by GyaanPath</title>
        <meta name="description" content="Discover our personalized printing products. Quality tees, business cards, mugs, & labels made just for you by GyaanPath Digital." />
      </Helmet>
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left flex flex-col items-center md:items-start">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Best Sellers</h1>
          <div className="flex items-center justify-center md:justify-start mb-6">
            <div className="h-0.5 w-12 bg-orange-500"></div>
            <div className="h-2 w-2 rounded-full border-2 border-orange-500 bg-white mx-1"></div>
            <div className="h-0.5 w-12 bg-orange-500"></div>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl font-normal">
            Discover our most loved personalized products. From professional branding to custom gifts, crafted with precision and delivered with care.
          </p>
        </div>

        {/* Product Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex ${
                product.featured ? 'flex-col md:flex-row col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2' : 'flex-col col-span-1'
              } ${product.reverse ? 'md:flex-row-reverse' : ''}`}
            >
              <div className={`${product.featured ? 'md:w-1/2' : 'h-64'} w-full bg-gray-100 flex items-center justify-center p-6 overflow-hidden relative`}>
                <img
                  alt={product.title}
                  className={`object-contain w-full h-full ${product.featured ? 'max-h-[300px]' : ''} group-hover:scale-105 transition-transform duration-300`}
                  src={product.image}
                />
              </div>
              <div className={`${product.featured ? 'md:w-1/2' : 'flex-grow'} w-full p-6 flex flex-col ${product.featured ? 'justify-center' : ''}`}>
                {product.featured && (
                  <div className="self-start bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    #1 Best Seller
                  </div>
                )}
                <h3 className={`${product.featured ? 'text-2xl mb-2' : 'text-lg mb-1'} font-bold text-gray-900`}>
                  {product.title}
                </h3>
                <p className={`text-gray-600 ${product.featured ? 'mb-4' : 'mb-auto font-normal text-sm'}`}>
                  {product.description}
                </p>
                <div className={`${product.featured ? '' : 'mt-4 flex items-center justify-between'}`}>
                  <a 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    href={`https://wa.me/917974889250?text=${encodeURIComponent('I need more info about print ' + product.title)}`} 
                    className="bg-orange-500 text-white hover:bg-orange-600 px-6 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 self-start inline-block"
                  >
                    Inquire
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
