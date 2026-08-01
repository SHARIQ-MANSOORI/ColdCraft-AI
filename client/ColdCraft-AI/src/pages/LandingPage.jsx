import React  from "react";
import {Link} from 'react-router-dom';
import {useAuth} from "../context/AuthContext"
import { ArrowRightIcon , BoltIcon , ChartBarIcon , DocumentTextIcon} from '@heroicons/react/24/outline'

const LandingPage = () => {
  const { user } = useAuth();
  const features = [
    {
      name: 'Lightning Fast Generation',
      description: 'Generate high-converting cold email sequences in seconds with AI.',
      icon: BoltIcon,
    },
    {
      name: 'Multi-Channel Outreach',
      description: 'Get cold email, LinkedIn DMs, and follow-ups perfectly synced.',
      icon: DocumentTextIcon,
    },
    {
      name: 'Higher Conversion Rates',
      description: 'Tailored tone & length ensuring higher open rates and replies.',
      icon: ChartBarIcon
    }
  ];

  return (
    <div className="bg-slate-50/60 min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md fixed w-full z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-blue-600 tracking-tight">
                ColdCraft<span className="text-mint-600">.ai</span>
              </span>
              {/* <span className="text-[10px] px-2 py-0.5 rounded-full bg-mint-50 text-mint-700 font-semibold border border-mint-200">
                Light Edition
              </span> */}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-200"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-600 hover:text-blue-600 font-medium px-3 py-2 text-sm transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-mint-500"></span>
            AI Cold Email Generator
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6">
            Write Cold Emails That <br className="hidden md:block" />
            <span className="text-blue-600">Get Real Responses</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Stop wasting hours writing cold outreach manually. Customize your writing tone, length, and prompt to get perfectly tailored sequences in seconds.
          </p>
          <div className="mt-10 flex justify-center gap-x-4">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all duration-200"
            >
              Start Generating for Free
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-20 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Designed for Modern SDRs</h2>
            <p className="mt-3 text-base text-slate-600">Minimal, fast, and light B2B email generation tool.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="p-8 bg-white rounded-xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all">
                <div className="h-12 w-12 rounded-lg bg-mint-50 border border-mint-200 flex items-center justify-center mb-5 text-mint-600">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Minimal Light CTA */}
      <div className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 via-white to-mint-50 border border-blue-200/80 rounded-2xl p-10 sm:p-14 text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ready to automate your cold outreach?
            </h2>
            <p className="mt-4 text-base text-slate-600 max-w-xl mx-auto">
              Create your account today and generate high-converting outreach campaigns effortlessly.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/signup"
                className="rounded-lg bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-all"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/70 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          <span className="text-lg font-bold text-blue-600 mb-2">
            ColdCraft<span className="text-mint-600">.ai</span>
          </span>
          <p className="text-slate-500 text-xs">© {new Date().getFullYear()} ColdCraft.ai. Minimal B2B Email Solution.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;