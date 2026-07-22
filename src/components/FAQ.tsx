'use client';

import React, { useState } from 'react';
import { Section, SectionHeader } from './ui/Section';
import { Card } from './ui/Card';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'How long do press-on nails last?',
    answer: 'With proper application and care, our press-on nails can last 1-2 weeks. Many customers report even longer wear times. The key is proper nail preparation and using the included adhesive tabs or glue correctly.',
  },
  {
    question: 'How do I measure my nails?',
    answer: 'We will collect a picture of your natural nails with each order to ensure a perfect fit.',
  },
  {
    question: 'Can I request custom designs?',
    answer: 'Absolutely! That\'s our specialty. You can share inspiration photos, describe your dream design, or let our artists create something unique for you. Custom orders are what we do best.',
  },
  {
    question: 'How long is production time?',
    answer: 'It will take about 10 to 20 days.',
  },
  {
    question: 'How should I remove the nails?',
    answer: 'We recommend using warm water and oil to gently loosen the nails. Soak for 10-15 minutes, then gently lift from the sides. Never force them off as this can damage your natural nails. We include detailed removal instructions with every order.',
  },
  {
    question: 'Can I reuse the nails?',
    answer: 'Yes! Our press-on nails can be reused multiple times with proper care. After removal, clean them gently and store them in the provided packaging. With adhesive tabs, you can easily reapply them whenever you want.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Section id="faq" className="bg-white/30">
      <SectionHeader
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about our press-on nails and services"
      />
      
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-300"
            onClick={() => toggleFAQ(index)}
          >
            <Card>
              <div className="flex items-center justify-between p-6">
                <h3 className="font-serif text-lg font-semibold text-foreground flex-1 pr-4">
                  {faq.question}
                </h3>
                <div
                  className={`text-2xl transition-transform duration-300 ${
                    openIndex === index ? 'rotate-45' : ''
                  }`}
                >
                  +
                </div>
              </div>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-foreground/80 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default FAQ;
