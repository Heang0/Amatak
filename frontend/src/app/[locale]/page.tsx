import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { FadeIn } from '@/components/ui/FadeIn';
import { Navbar } from '@/components/ui/Navbar';
import PricingSection from '@/components/ui/PricingSection';
import FAQSection from '@/components/ui/FAQSection';
import ContactForm from '@/components/ui/ContactForm';
import { Building2, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';

export default function Index() {
  const t = useTranslations('Index');

  const locale = useLocale();
  const isKm = locale === 'km';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden min-h-screen pt-20">
        {/* Dynamic Background with Professional Gradient Mask */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-white dark:bg-[#050505] pointer-events-none">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60 dark:opacity-30 pointer-events-none"
          >
            <source src="/video/ecommerce.mp4" type="video/mp4" />
          </video>
          {/* Radial Gradient for Focus */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/30 via-white/80 to-white dark:from-black/30 dark:via-[#050505]/90 dark:to-[#050505]"></div>
          {/* Ambient Top Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-[#E84C3D]/10 dark:bg-[#E84C3D]/5 blur-[100px] rounded-full pointer-events-none"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full w-full relative z-10 flex flex-col items-center justify-center">
          <FadeIn delay={0.1}>
            <div className="text-center mb-8 max-w-5xl mx-auto">


              <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[72px] font-black tracking-[-0.02em] text-gray-900 dark:text-white leading-[1.05] mb-8">
                {isKm
                  ? "ដំណើរការអាជីវកម្មអនឡាញរបស់អ្នក "
                  : "Run your entire online business "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E84C3D] to-orange-500">
                  {isKm ? "ប្រកបដោយភាពឆ្លាតវៃ" : "smartly"}
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto font-medium tracking-tight">
                {isKm
                  ? "គ្រប់គ្រងការលក់ ស្តុកទំនិញ និងអតិថិជនពីគ្រប់ទីកន្លែង ដោយមិនចាំបាច់មានជំនាញបច្ចេកទេស។"
                  : "Manage sales, inventory, and customers from anywhere with zero technical skills required."}
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Link href="/register" className="group inline-flex items-center justify-center gap-2 px-6 py-2 text-base font-bold bg-[#E84C3D] text-white rounded-full hover:bg-red-600 hover:-translate-y-0.5 transition-all duration-300 shadow-[0_0_20px_rgba(232,76,61,0.3)] hover:shadow-[0_0_30px_rgba(232,76,61,0.5)]">
                {isKm ? "ចាប់ផ្តើមប្រើប្រាស់ឥតគិតថ្លៃ" : "Start Using for Free"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#demo" className="inline-flex items-center justify-center gap-2 px-6 py-2 text-base font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-full hover:bg-white dark:hover:bg-gray-800 hover:-translate-y-0.5 transition-all duration-300 shadow-sm hover:shadow-md">
                {isKm ? "ស្វែងយល់បន្ថែម" : "Learn More"}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Product Showcase - Unique Overlapping Layout */}
      <section className="relative z-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto pt-16">
        <FadeIn delay={0.3} zoom={true}>
          <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-3xl bg-gray-900 dark:bg-black shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-gray-800/80 flex items-center justify-center overflow-hidden group">

            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=2000&q=80" alt="Dashboard Mockup" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent dark:from-black dark:via-black/20"></div>

            {/* Ambient glow inside the mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#E84C3D]/20 blur-[120px] rounded-full"></div>

            <div className="relative z-10 text-center">
              <div className="w-20 h-20 bg-gray-800/80 backdrop-blur-md rounded-2xl mx-auto mb-6 flex items-center justify-center border border-gray-700/50 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(232,76,61,0.2)]">
                <img src="/logo/logo-website.png" alt="Amatak" className="w-12 h-12 object-contain" />
              </div>
            </div>

            {/* Overlapping Mobile Mockup */}
            <div className="absolute -bottom-10 -right-10 lg:bottom-10 lg:right-20 w-[200px] lg:w-[280px] aspect-[9/19] bg-gray-950 rounded-[2.5rem] border-[8px] border-gray-800 shadow-2xl flex flex-col overflow-hidden group-hover:-translate-y-4 transition-transform duration-500">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-5 bg-gray-800 rounded-b-xl z-10"></div>
              <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80" alt="Mobile Storefront" className="w-full h-full object-cover opacity-80" />
              <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                <span className="text-white text-sm font-bold bg-[#E84C3D] px-3 py-1 rounded-full">{isKm ? "ទិញឥឡូវនេះ" : "Buy Now"}</span>
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute top-10 lg:top-20 -left-10 lg:left-20 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl hidden md:flex flex-col gap-2 group-hover:translate-y-4 transition-transform duration-500">
              <span className="text-gray-300 text-sm">{isKm ? "ចំណូលថ្ងៃនេះ" : "Today's Revenue"}</span>
              <span className="text-3xl font-bold text-white">$1,240.00</span>
              <span className="text-[#00C853] text-sm font-medium">+15% {isKm ? "កើនឡើង" : "Growth"}</span>
            </div>

            {/* Floating Telegram Notification Card */}
            <div className="absolute bottom-10 lg:bottom-20 -left-10 lg:left-32 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl hidden lg:flex items-center gap-4 group-hover:-translate-y-4 transition-transform duration-500 delay-100">
              <div className="w-12 h-12 rounded-full bg-[#0088cc] flex items-center justify-center text-white shrink-0 shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.18 3.42-.49.33-.94.5-1.35.49-.45-.01-1.32-.26-1.96-.46-.79-.26-1.42-.4-1.37-.84.03-.23.34-.47.93-.72 3.65-1.59 6.09-2.64 7.31-3.15 3.47-1.45 4.19-1.71 4.67-1.72.11 0 .35.03.48.14.11.09.14.22.15.34.01.07.01.16 0 .2z" /></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm">🛍️ New Order Paid!</span>
                <span className="text-gray-300 text-xs">Total: $45.00 via KHQR</span>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Integration Partners Strip */}
        <FadeIn delay={0.4}>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col items-center">
            <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-6 text-center">
              {isKm ? "ភ្ជាប់ជាមួយនឹងបច្ចេកវិទ្យាល្បីៗ" : "Seamlessly Integrates With"}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 transition-all duration-500">
              <div className="flex items-center gap-2 font-bold text-xl text-[#0088cc]"><svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.18 3.42-.49.33-.94.5-1.35.49-.45-.01-1.32-.26-1.96-.46-.79-.26-1.42-.4-1.37-.84.03-.23.34-.47.93-.72 3.65-1.59 6.09-2.64 7.31-3.15 3.47-1.45 4.19-1.71 4.67-1.72.11 0 .35.03.48.14.11.09.14.22.15.34.01.07.01.16 0 .2z" /></svg> Telegram</div>
              <div className="flex items-center gap-2 font-bold text-xl text-[#E84C3D]">
                <img src="/logo/KHQR%20available%20here%20-%20logo%20with%20bg.png" alt="KHQR" className="h-8 object-contain rounded-md" />
                KHQR
              </div>
              <div className="flex items-center gap-2 font-bold text-xl text-[#E82C2A]">
                <img src="/logo/bakong-logo.jpg" alt="Bakong" className="h-8 w-8 object-cover rounded-full shadow-sm" />
                Bakong
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Advanced Features (Services) Bento Grid */}
      <section id="services" className="py-32 bg-gray-50 dark:bg-[#0a0a0a] relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.1}>
            <div className="text-center mb-16">
              <span className="text-[#E84C3D] font-bold tracking-widest uppercase text-sm mb-2 block">
                {isKm ? "មុខងារពិសេសៗ" : "Powerful Features"}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                {isKm ? "អ្វីគ្រប់យ៉ាងដែលអ្នកត្រូវការ ដើម្បីរីកចម្រើន" : "Everything you need to grow"}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {isKm ? "បំពាក់ដោយបច្ចេកវិទ្យាទំនើប ដើម្បីជួយឱ្យការលក់របស់អ្នកកាន់តែងាយស្រួល និងរហ័ស។" : "Equipped with state-of-the-art technology to make selling easier and faster."}
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            {/* Big Bento Box 1 */}
            <FadeIn delay={0.2} className="md:col-span-2 relative bg-white dark:bg-[#111111] rounded-3xl p-8 md:p-12 overflow-hidden border border-gray-100 dark:border-gray-800/80 shadow-sm group hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-300">
              <div className="relative z-10 w-full md:w-2/3">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-6 text-[#E84C3D] ring-1 ring-red-100 dark:ring-red-900/30">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
                  {isKm ? "ការទូទាត់រហ័សតាម KHQR" : "Instant KHQR Payments"}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {isKm ? "លែងបារម្ភរឿងផ្ទៀងផ្ទាត់វិក្កយបត្រ! ប្រព័ន្ធរបស់យើងភ្ជាប់ជាមួយ Bakong KHQR ដោយផ្ទាល់ អតិថិជនស្កេនទូទាត់ភ្លាម វិក្កយបត្រនឹងបញ្ជាក់ដោយស្វ័យប្រវត្តិ។" : "Stop manually verifying receipts! Our system integrates directly with Bakong KHQR. Customers scan, pay, and the order is instantly verified."}
                </p>
              </div>
              <img loading="lazy" src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=70" alt="Payment" className="absolute -right-20 -bottom-20 w-[400px] h-[400px] object-cover rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />
            </FadeIn>

            {/* Small Bento Box 1 */}
            <FadeIn delay={0.3} className="relative bg-[#E84C3D] rounded-3xl p-8 md:p-10 overflow-hidden shadow-[0_10px_30px_rgba(232,76,61,0.2)] group text-white">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md ring-1 ring-white/30">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.18 3.42-.49.33-.94.5-1.35.49-.45-.01-1.32-.26-1.96-.46-.79-.26-1.42-.4-1.37-.84.03-.23.34-.47.93-.72 3.65-1.59 6.09-2.64 7.31-3.15 3.47-1.45 4.19-1.71 4.67-1.72.11 0 .35.03.48.14.11.09.14.22.15.34.01.07.01.16 0 .2z" /></svg>
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight mb-3">{isKm ? "Telegram Bot" : "Telegram Bot"}</h3>
                <p className="text-white/80 leading-relaxed font-medium">
                  {isKm ? "ទទួលការជូនដំណឹងរាល់ពេលមានការបញ្ជាទិញថ្មី ចូលទៅកាន់គ្រុប Telegram របស់អ្នកភ្លាមៗ។" : "Get instant notifications for every new order directly to your merchant Telegram group."}
                </p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
            </FadeIn>

            {/* Small Bento Box 2 */}
            <FadeIn delay={0.4} className="relative bg-gray-900 dark:bg-black rounded-3xl p-8 md:p-10 overflow-hidden shadow-lg group border border-gray-800 text-white hover:border-gray-700 transition-colors duration-300">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gray-800/80 rounded-xl flex items-center justify-center mb-6 ring-1 ring-gray-700">
                  <ShieldCheck className="w-6 h-6 text-[#00C853]" />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight mb-3">{isKm ? "សុវត្ថិភាពទិន្នន័យ" : "Secure Data"}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  {isKm ? "ទិន្នន័យអាជីវកម្ម និងអតិថិជនរបស់អ្នកត្រូវបានរក្សាទុកដោយសុវត្ថិភាពបំផុតនៅលើ Cloud។" : "Your business and customer data are secured with enterprise-grade cloud encryption."}
                </p>
              </div>
            </FadeIn>

            {/* Big Bento Box 2 */}
            <FadeIn delay={0.5} className="md:col-span-2 relative bg-white dark:bg-[#111111] rounded-3xl p-8 md:p-12 overflow-hidden border border-gray-100 dark:border-gray-800/80 shadow-sm group hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-300">
              <div className="relative z-10 w-full md:w-2/3">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mb-6 text-[#E84C3D] ring-1 ring-red-100 dark:ring-red-900/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900 dark:text-white">
                  {isKm ? "ប្រព័ន្ធគ្រប់គ្រងការបញ្ជាទិញ & ស្តុក" : "Order & Inventory Management"}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {isKm ? "តាមដានរាល់ការបញ្ជាទិញ និងកាត់ស្តុកដោយស្វ័យប្រវត្តិ។ អ្វីគ្រប់យ៉ាងដំណើរការស៊ីសង្វាក់គ្នានៅក្នុងប្រព័ន្ធតែមួយ ដើម្បីជួយឱ្យអ្នកលក់បានកាន់តែច្រើន។" : "Track all your orders and sync your inventory automatically. Everything works seamlessly in one platform to help you sell more."}
                </p>
              </div>
              <img loading="lazy" src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=600&q=70" alt="POS System" className="absolute -right-20 -top-20 w-[450px] h-[450px] object-cover rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none" />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* About Section - Story & Stats Layout */}
      <section id="about" className="py-32 bg-white dark:bg-[#050505] relative z-10 border-t border-gray-100 dark:border-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Images Grid */}
            <FadeIn delay={0.2} className="relative" zoom={true}>
              <div className="grid grid-cols-2 gap-4">
                <img loading="lazy" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=70" alt="Team" className="rounded-[2rem] w-full h-[320px] object-cover mt-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800" />
                <img loading="lazy" src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=70" alt="Office" className="rounded-[2rem] w-full h-[320px] object-cover shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-800" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#E84C3D]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            </FadeIn>

            {/* Content */}
            <FadeIn delay={0.3}>
              <span className="text-[#E84C3D] font-bold tracking-widest uppercase text-sm mb-4 block">
                {isKm ? "អំពីពួកយើង" : "About Us"}
              </span>
              <h2 className="text-4xl md:text-5xl font-black mb-8 text-gray-900 dark:text-white leading-[1.1] tracking-tight">
                {isKm ? "បេសកកម្មរបស់យើងគឺ ជួយអ្នកឱ្យជោគជ័យ" : "Our mission is to help your business thrive"}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed font-medium">
                {isKm
                  ? "Amatak ត្រូវបានបង្កើតឡើងក្នុងគោលបំណងដោះស្រាយបញ្ហាស្មុគស្មាញរបស់អ្នកលក់អនឡាញនៅកម្ពុជា។ យើងផ្តោតសំខាន់លើការបង្កើតបច្ចេកវិទ្យាដែលងាយស្រួលប្រើ ប៉ុន្តែមានប្រសិទ្ធភាពខ្ពស់ ក្នុងការគ្រប់គ្រងអាជីវកម្មទាំងមូលក្នុងប្រព័ន្ធតែមួយ។"
                  : "Amatak was built to solve the complex challenges faced by online sellers. We focus on building technology that is extremely easy to use, yet incredibly powerful for managing your entire business ecosystem in one place."}
              </p>

              <div className="grid grid-cols-2 gap-8 mt-12 pt-12 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <h4 className="text-4xl font-black text-gray-900 dark:text-white mb-2">99.9%</h4>
                  <p className="text-gray-600 font-medium">{isKm ? "ប្រព័ន្ធដំណើរការមិនរអាក់រអួល" : "System Uptime Guaranteed"}</p>
                </div>
                <div>
                  <h4 className="text-4xl font-black text-[#E84C3D] mb-2">24/7</h4>
                  <p className="text-gray-600 font-medium">{isKm ? "សេវាកម្មជួយគាំទ្រជានិច្ច" : "Dedicated Support Availability"}</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection isKm={isKm} />

      {/* FAQ Section */}
      <FAQSection isKm={isKm} />

      {/* Clean & Professional Contact Section */}
      <section id="contact" className="py-24 bg-white dark:bg-[#050505] relative z-10 border-t border-gray-100 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">

            {/* Contact Information */}
            <FadeIn delay={0.1}>
              <span className="text-[#E84C3D] font-bold tracking-widest uppercase text-sm mb-4 block">
                {isKm ? "ទំនាក់ទំនង" : "Contact Us"}
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white leading-tight">
                {isKm ? "តើមានអ្វីឱ្យយើងជួយអ្នក?" : "How can we help you?"}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
                {isKm
                  ? "ពួកយើងរង់ចាំជានិច្ចក្នុងការឆ្លើយតបរាល់ចម្ងល់របស់អ្នក។ សូមទាក់ទងមកកាន់ក្រុមការងារយើងតាមរយៈព័ត៌មានខាងក្រោម។"
                  : "We're here to help and answer any question you might have. We look forward to hearing from you."}
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0 text-[#E84C3D]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{isKm ? "អ៊ីមែល" : "Email"}</h4>
                    <p className="text-gray-600 dark:text-gray-300">support@amatak.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0 text-[#E84C3D]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{isKm ? "លេខទូរស័ព្ទ" : "Phone"}</h4>
                    <p className="text-gray-600 dark:text-gray-300">096 392 5127</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0 text-[#E84C3D]">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.18 3.42-.49.33-.94.5-1.35.49-.45-.01-1.32-.26-1.96-.46-.79-.26-1.42-.4-1.37-.84.03-.23.34-.47.93-.72 3.65-1.59 6.09-2.64 7.31-3.15 3.47-1.45 4.19-1.71 4.67-1.72.11 0 .35.03.48.14.11.09.14.22.15.34.01.07.01.16 0 .2z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Telegram</h4>
                    <a href="https://t.me/Emma_Heang" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-300 hover:text-[#E84C3D] transition-colors">
                      @Emma_Heang
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shrink-0 text-[#E84C3D]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{isKm ? "ទីតាំងទីស្នាក់ការ" : "Office"}</h4>
                    <p className="text-gray-600 dark:text-gray-300">Phnom Penh, Cambodia</p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Contact Form Container */}
            <FadeIn delay={0.2} className="bg-gray-50 dark:bg-[#111111] rounded-[2rem] p-8 md:p-10 border border-gray-100 dark:border-gray-800 shadow-sm">
              <ContactForm isKm={isKm} />
            </FadeIn>

          </div>
        </div>
      </section>

      {/* Ultra-Clean Modern Footer */}
      <footer className="bg-white dark:bg-[#050505] border-t border-gray-100 dark:border-gray-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <Link href="/" className="inline-block hover:opacity-80 transition-opacity mb-4">
                <img
                  src="/logo/logo-website.png"
                  alt="Amatak Logo"
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {isKm
                  ? "អមតៈជាវេទិកាលក់ទំនិញតាមអ៊ីនធឺណិតចុងក្រោយរបស់អ្នក។"
                  : "Amatak, your ultimate online shopping platform."}
              </p>
            </div>

            {/* Inline Navigation Links */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-bold text-gray-700 dark:text-gray-300">
              <a href="#about" className="hover:text-[#E84C3D] transition-colors">{isKm ? "អំពីយើង" : "About Us"}</a>
              <a href="#services" className="hover:text-[#E84C3D] transition-colors">{isKm ? "មុខងារពិសេស" : "Features"}</a>
              <a href="#pricing" className="hover:text-[#E84C3D] transition-colors">{isKm ? "តម្លៃ" : "Pricing"}</a>
              <a href="#" className="hover:text-[#E84C3D] transition-colors">{isKm ? "លក្ខខណ្ឌប្រើប្រាស់" : "Terms"}</a>
              <a href="#" className="hover:text-[#E84C3D] transition-colors">{isKm ? "ឯកជនភាព" : "Privacy"}</a>
            </div>
          </div>

          <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-6 pt-8 border-t border-gray-100 dark:border-gray-900">
            {/* Copyright */}
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center md:text-left font-medium">
              &copy; {new Date().getFullYear()} Amatak. {isKm ? "រក្សាសិទ្ធិគ្រប់យ៉ាង។" : "All rights reserved."}
            </p>

            {/* Social Icons (Minimalist) */}
            <div className="flex items-center gap-5 text-gray-400 dark:text-gray-500">
              <a href="#" className="hover:text-[#1877F2] transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" /></svg>
              </a>
              <a href="#" className="hover:text-[#0088cc] transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.05c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.52 8.52 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" /></svg>
              </a>
              <a href="https://t.me/Emma_Heang" target="_blank" rel="noopener noreferrer" className="hover:text-[#0088cc] transition-colors" aria-label="Telegram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.18-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.18 3.42-.49.33-.94.5-1.35.49-.45-.01-1.32-.26-1.96-.46-.79-.26-1.42-.4-1.37-.84.03-.23.34-.47.93-.72 3.65-1.59 6.09-2.64 7.31-3.15 3.47-1.45 4.19-1.71 4.67-1.72.11 0 .35.03.48.14.11.09.14.22.15.34.01.07.01.16 0 .2z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
