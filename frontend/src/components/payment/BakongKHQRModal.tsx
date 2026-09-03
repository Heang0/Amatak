'use client';

import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

interface BakongKHQRModalProps {
  qrString: string;
  amount: number;
  currency: string;
  merchantName?: string;
  isPaid: boolean;
  locale?: string;
  mode?: 'order' | 'subscription';
  themeStyle?: string;
  onClose: () => void;
  onSuccessClose?: () => void;
  onSimulatePay?: () => void;
}

export default function BakongKHQRModal({
  qrString,
  amount,
  currency,
  merchantName = 'Amatak Merchant',
  isPaid,
  locale = 'en',
  mode = 'order',
  themeStyle = 'default',
  onClose,
  onSuccessClose,
}: BakongKHQRModalProps) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [mounted, setMounted] = useState(false);
  const isKm = locale === 'km';

  useEffect(() => {
    setMounted(true);
  }, []);

  const khmerFont = { fontFamily: "var(--font-kantumruy), 'Kantumruy Pro', sans-serif" };
  const numFont = { fontFamily: '"Nunito Sans", "Inter", sans-serif' };

  const text = {
    cancelPayment: isKm ? 'បោះបង់ការទូទាត់?' : 'Cancel Payment?',
    cancelConfirm: isKm ? 'តើអ្នកប្រាកដជាចង់បោះបង់ប្រតិបត្តិការនេះមែនទេ?' : 'Are you sure you want to cancel this transaction?',
    no: isKm ? 'ទេ' : 'No, keep it',
    yes: isKm ? 'បាទ/ចាស, បោះបង់' : 'Yes, cancel',
    paymentSuccessful: mode === 'subscription' 
      ? (isKm ? 'ការទិញសេវាកម្មជោគជ័យ!' : 'Upgrade Successful!')
      : (isKm ? 'ការទូទាត់បានជោគជ័យ!' : 'Payment Successful!'),
    verified: mode === 'subscription'
      ? (isKm ? 'អ្នកបានទិញគម្រោងនេះដោយជោគជ័យ។' : 'Your plan has been upgraded successfully.')
      : (isKm ? 'ប្រតិបត្តិការរបស់អ្នកត្រូវបានផ្ទៀងផ្ទាត់និងបញ្ជាក់ដោយជោគជ័យ។' : 'Your payment has been verified and confirmed.'),
    orderConfirmed: mode === 'subscription'
      ? (isKm ? 'ការជាវបានបញ្ជាក់' : 'Subscription Confirmed')
      : (isKm ? 'ការបញ្ជាទិញបានបញ្ជាក់' : 'Order Confirmed'),
    continue: mode === 'subscription'
      ? (isKm ? 'ត្រឡប់ទៅកាន់ផ្ទាំងគ្រប់គ្រង' : 'Back to Dashboard')
      : (isKm ? 'បន្តទិញទំនិញ' : 'Continue Shopping'),
    expiresIn: isKm ? 'ផុតកំណត់ក្នុង' : 'Expires in',
    scanQR: isKm ? 'ស្កេនដើម្បីទូទាត់' : 'Scan to Pay',
    awaitingPayment: isKm ? 'កំពុងរង់ចាំការទូទាត់...' : 'Awaiting payment...',
    securePayment: isKm ? 'ការទូទាត់មានសុវត្ថិភាព' : 'Secure Payment',
  };

  useEffect(() => {
    if (isPaid || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isPaid, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 flex flex-col items-center justify-center p-4">

      {/* Main Container */}
      <div className="relative flex flex-col items-center">

        {/* KHQR Card */}
        <div
          className={`bg-white relative overflow-hidden flex flex-col ${
            themeStyle === 'neo-brutalism' ? 'border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none' : 
            themeStyle === 'skincare-clean' ? 'rounded-3xl shadow-sm' : 'rounded-2xl'
          }`}
          style={{ width: '330px', height: '479px', fontFamily: isKm ? khmerFont.fontFamily : numFont.fontFamily, boxShadow: themeStyle === 'neo-brutalism' ? undefined : (themeStyle === 'skincare-clean' ? '0 4px 12px rgba(0,0,0,0.05)' : '0 0 16px rgba(0,0,0,0.1)') }}
        >
          {/* Header */}
          <div className="h-[57px] bg-[#E1232E] w-full shrink-0 flex items-center justify-end px-4 relative z-10">
            {/* Centered Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo/KHQR Logo.png" 
              alt="KHQR" 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 object-contain brightness-0 invert" 
            />
            {/* Close Button */}
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors absolute right-4"
              title={text.cancelPayment}
            >
              <X size={18} />
            </button>
          </div>

          {/* Amount Area */}
          <div className="bg-[#E1232E] w-full pt-1 pb-4 shrink-0 flex flex-col items-center justify-center relative z-10">
            <div className="text-white text-3xl font-bold tracking-tight" style={numFont}>
              {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
            </div>
            {/* Simulate Pay Button (Only on localhost) */}
            {onSimulatePay && process.env.NODE_ENV === 'development' && (
              <button 
                onClick={onSimulatePay}
                className="mt-2 text-[10px] bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors"
              >
                Simulate Payment
              </button>
            )}
          </div>

          {/* QR Area */}
          <div className="flex-1 bg-white relative flex flex-col items-center justify-center p-6">
            <div className="text-center mb-5 w-full">
              <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider truncate px-4" style={isKm ? khmerFont : numFont}>{merchantName}</h2>
              <p className="text-xs text-gray-500 mt-1" style={numFont}>{text.scanQR}</p>
            </div>
            
            <div className="bg-white p-2 border border-gray-100 shadow-sm rounded-xl mb-4 relative z-20">
              <QRCodeSVG
                value={qrString}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/logo/Bakong Logo.png",
                  x: undefined,
                  y: undefined,
                  height: 38,
                  width: 38,
                  excavate: true,
                }}
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium" style={isKm ? khmerFont : numFont}>
              <Clock size={12} className="animate-pulse text-[#E1232E]" />
              <span>{text.expiresIn} <span className="font-bold text-[#E1232E]" style={numFont}>{formatTime(timeLeft)}</span></span>
            </div>
          </div>

          {/* Bottom Wave/Pattern */}
          <div className="h-10 w-full shrink-0 flex">
            {/* Simple geometric pattern replacing the wave */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex-1 bg-[#E1232E] rounded-t-full -mb-4" />
            ))}
          </div>

          {/* Cancel Confirmation Overlay */}
          {showCancelConfirm && !isPaid && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <X size={32} className="text-[#E1232E]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2" style={isKm ? khmerFont : numFont}>{text.cancelPayment}</h3>
              <p className="text-sm text-gray-500 mb-6" style={isKm ? khmerFont : numFont}>
                {text.cancelConfirm}
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                  style={isKm ? khmerFont : numFont}
                >
                  {text.no}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-[#E1232E] text-white font-bold rounded-xl hover:bg-red-700 transition-colors text-sm"
                  style={isKm ? khmerFont : numFont}
                >
                  {text.yes}
                </button>
              </div>
            </div>
          )}

          {/* Success Overlay */}
          {isPaid && (
            <div className="absolute inset-0 bg-white z-30 flex flex-col items-center justify-center p-8 text-center">
              {/* Animated success ring */}
              <div className="relative mb-6">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  themeStyle === 'neo-brutalism' ? 'bg-green-400 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 
                  themeStyle === 'skincare-clean' ? 'bg-green-100/50' : 'bg-[#E1232E]/10'
                }`}>
                  <CheckCircle2 size={52} className={
                    themeStyle === 'neo-brutalism' ? 'text-black' : 
                    themeStyle === 'skincare-clean' ? 'text-green-500' : 'text-[#E1232E]'
                  } strokeWidth={themeStyle === 'neo-brutalism' ? 2.5 : 1.8} />
                </div>
                {themeStyle !== 'neo-brutalism' && <div className={`absolute inset-0 rounded-full border-4 animate-ping opacity-30 ${themeStyle === 'skincare-clean' ? 'border-green-500/30' : 'border-[#E1232E]/30'}`} />}
              </div>

              <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 mb-3 ${
                themeStyle === 'neo-brutalism' ? 'bg-black text-white border-2 border-black rounded-none' : 
                themeStyle === 'skincare-clean' ? 'bg-green-100/50 text-green-600 rounded-full' : 'bg-[#E1232E]/10 text-[#E1232E] rounded-full'
              }`} style={numFont}>
                {text.orderConfirmed}
              </span>

              <h3
                className="text-2xl font-bold text-gray-900 mb-2"
                style={isKm ? khmerFont : numFont}
              >
                {text.paymentSuccessful}
              </h3>

              <p
                className="text-sm text-gray-500 mb-2 leading-relaxed"
                style={isKm ? khmerFont : numFont}
              >
                {text.verified}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-8" style={numFont}>
                <ShieldCheck size={12} className="text-green-400" />
                <span>{text.securePayment}</span>
              </div>

              <button
                onClick={onSuccessClose || onClose}
                className={
                  themeStyle === 'neo-brutalism' ? "w-full py-4 bg-green-400 hover:bg-green-500 text-black font-black uppercase tracking-wider border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm" : 
                  themeStyle === 'skincare-clean' ? "w-full py-4 bg-gray-900 hover:bg-black text-white font-medium rounded-3xl transition-colors shadow-sm text-sm" : 
                  "w-full py-4 bg-[#E1232E] hover:bg-red-700 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
                }
                style={isKm ? khmerFont : numFont}
              >
                {text.continue}
              </button>
            </div>
          )}
        </div>

        {/* Powered by tag */}
        <p className="text-white/30 text-xs mt-4 font-medium" style={numFont}>Powered by Bakong KHQR · NBC Cambodia</p>
      </div>
    </div>,
    document.getElementById('app-root') || document.body
  );
}
