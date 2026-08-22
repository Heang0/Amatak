'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from './FadeIn';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-[#E84C3D]"
      >
        <span className="text-lg font-bold text-gray-900 dark:text-white pr-8">
          {question}
        </span>
        <span className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#E84C3D]' : ''}`}>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection({ isKm }: { isKm: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: isKm ? "តើអ្វីទៅជា Amatak?" : "What is Amatak?",
      answer: isKm 
        ? "Amatak គឺជាប្រព័ន្ធពាណិជ្ជកម្មអេឡិចត្រូនិក (E-commerce Platform) ដ៏ទំនើបមួយដែលអនុញ្ញាតឱ្យអ្នកលក់អាចបង្កើតហាងអនឡាញផ្ទាល់ខ្លួន គ្រប់គ្រងស្តុក និងទទួលការទូទាត់ប្រាក់តាមរយៈ KHQR និង Telegram យ៉ាងងាយស្រួល។" 
        : "Amatak is an ultimate multi-vendor e-commerce platform that allows merchants to easily create their own online store, manage inventory, and seamlessly accept payments via KHQR and Telegram integrations."
    },
    {
      question: isKm ? "តើខ្ញុំត្រូវចាប់ផ្តើមលក់ដោយរបៀបណា?" : "How do I start selling?",
      answer: isKm
        ? "គ្រាន់តែចុះឈ្មោះបង្កើតគណនី រួចបំពេញព័ត៌មានហាងរបស់អ្នក និងបន្ថែមផលិតផល។ អ្នកអាចចាប់ផ្តើមទទួលការបញ្ជាទិញភ្លាមៗបន្ទាប់ពីដំឡើង KHQR សម្រាប់ការទូទាត់។"
        : "Simply register for an account, fill in your store details, and add your products. You can start receiving orders immediately after setting up your KHQR for payments."
    },
    {
      question: isKm ? "តើខ្ញុំត្រូវការជំនាញបច្ចេកទេសដើម្បីប្រើប្រាស់វាទេ?" : "Do I need technical skills to use it?",
      answer: isKm
        ? "ទេ អ្នកមិនចាំបាច់មានជំនាញបច្ចេកទេស ឬកូដឡើយ! ប្រព័ន្ធរបស់យើងត្រូវបានរចនាឡើងយ៉ាងសាមញ្ញបំផុតសម្រាប់អ្នកលក់គ្រប់រូប។"
        : "No, you don't need any technical or coding skills! Our platform is designed to be extremely intuitive and easy to use for everyone."
    },
    {
      question: isKm ? "តើប្រព័ន្ធនេះមានសុវត្ថិភាពដែរឬទេ?" : "Is the platform secure?",
      answer: isKm
        ? "ប្រាកដណាស់! យើងប្រើប្រាស់បច្ចេកវិទ្យាសុវត្ថិភាពកម្រិតខ្ពស់ ដើម្បីការពារទិន្នន័យអតិថិជន និងការទូទាត់ប្រាក់របស់អ្នក ដោយធានាបាននូវប្រតិបត្តិការ 99.9%។"
        : "Absolutely! We use high-level security technologies to protect your customer data and payments, ensuring a 99.9% uptime guarantee."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-gray-50 dark:bg-[#0a0a0a] relative z-10 border-t border-gray-100 dark:border-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <span className="text-[#E84C3D] font-bold tracking-widest uppercase text-sm mb-4 block">
            {isKm ? "សំណួរដែលសួរញឹកញាប់" : "FAQ"}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
            {isKm ? "សំណួរដែលត្រូវបានសួរញឹកញាប់បំផុត" : "Frequently Asked Questions"}
          </h2>
        </FadeIn>

        <FadeIn delay={0.2} className="bg-white dark:bg-[#111111] rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
