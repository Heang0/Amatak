"use client";

import { Link, usePathname } from "@/navigation";
import { useTheme } from "next-themes";
import { useTranslations, useLocale } from "next-intl";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const t = useTranslations("Index");
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const locale = useLocale();

  useEffect(() => setMounted(true), []);

  const navLinks = [
    { href: "/", label: locale === 'km' ? 'ទំព័រដើម' : 'Home' },
    { href: "#about", label: locale === 'km' ? 'អំពីយើង' : 'About Us' },
    { href: "#services", label: locale === 'km' ? 'សេវាកម្ម' : 'Services' },
    { href: "#contact", label: locale === 'km' ? 'ទំនាក់ទំនង' : 'Contact' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-[#050505]/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img
                  src="/logo/logo-website.png"
                  alt="Amatak Logo"
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1 mx-8">
              <div className="flex items-center space-x-8">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-[#E84C3D] dark:hover:text-[#E84C3D] transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Actions (Language, Theme, Login, Hamburger) */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              {mounted ? (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors hidden sm:flex items-center justify-center"
                  aria-label="Toggle Dark Mode"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              ) : (
                <div className="w-[38px] h-[38px] hidden sm:block"></div>
              )}

              <Link
                href={pathname}
                locale={locale === 'en' ? 'km' : 'en'}
                className="flex items-center justify-center hover:opacity-80 transition-opacity"
                title="Toggle Language"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={locale === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/kh.png'} 
                  alt={locale} 
                  className="w-6 h-auto rounded-sm ring-1 ring-gray-900/5 dark:ring-white/10" 
                />
              </Link>

              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-[#E84C3D] text-white rounded-full text-sm font-bold hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {t("login")}
              </Link>

              {/* Hamburger Icon for Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Open Mobile Menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar (Animated Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl z-[70] md:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-900">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <img
                    src="/logo/logo-website.png"
                    alt="Amatak Logo"
                    className="h-8 w-auto object-contain"
                  />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex flex-col px-6 py-8 overflow-y-auto flex-1">
                <div className="flex flex-col mb-8">
                  {navLinks.map((link, i) => (
                    <motion.a
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, ease: "easeOut" }}
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800/60 text-gray-900 dark:text-white font-bold text-xl hover:text-[#E84C3D] dark:hover:text-[#E84C3D] transition-colors group"
                    >
                      <span>{link.label}</span>
                      <svg className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-[#E84C3D] group-hover:translate-x-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </motion.a>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-auto flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Theme Toggle */}
                    <button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all"
                    >
                      {mounted ? (
                        <>
                          {theme === "dark" ? <Sun size={18} className="text-gray-400" /> : <Moon size={18} className="text-gray-500" />}
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {theme === "dark" ? (locale === 'km' ? "ភ្លឺ" : "Light Mode") : (locale === 'km' ? "ងងឹត" : "Dark Mode")}
                          </span>
                        </>
                      ) : (
                        <div className="h-[22px]"></div>
                      )}
                    </button>
                    
                    {/* Language Toggle */}
                    <Link
                      href={pathname}
                      locale={locale === 'en' ? 'km' : 'en'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-gray-50 dark:bg-[#111111] border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={locale === 'en' ? 'https://flagcdn.com/w40/us.png' : 'https://flagcdn.com/w40/kh.png'} 
                        alt={locale} 
                        className="w-5 h-auto rounded-sm ring-1 ring-gray-900/5 dark:ring-white/10" 
                      />
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {locale === 'en' ? "English" : "ភាសាខ្មែរ"}
                      </span>
                    </Link>
                  </div>

                  <Link
                    onClick={() => setIsMobileMenuOpen(false)}
                    href="/login"
                    className="flex items-center justify-center w-full py-2.5 bg-[#E84C3D] text-white rounded-xl font-bold text-base shadow-[0_10px_20px_rgba(232,76,61,0.2)] hover:bg-red-600 hover:-translate-y-0.5 transition-all"
                  >
                    {t("login")}
                  </Link>
                  
                  <div className="text-center mt-6">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase">
                      Amatak &copy; {new Date().getFullYear()}
                    </span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
