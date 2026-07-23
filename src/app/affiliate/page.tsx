'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { motion } from 'motion/react';
import { Rocket, Sparkles, TrendingUp, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AffiliatePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="relative py-24 overflow-hidden bg-emerald-950 text-white">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500 blur-[120px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400 blur-[120px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-6 uppercase tracking-[0.2em] px-4 py-1 rounded-full text-xs font-black">
                 Partner Program
              </Badge>
              <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">
                Create the Future, <br />
                <span className="text-emerald-400">Inspire Together.</span>
              </h1>
              <p className="text-lg md:text-xl text-emerald-100/70 font-medium mb-12 leading-relaxed">
                Our exclusive partner referral network is designed to reward designers, decorators, memory-preservation advocates, and art enthusiasts who share Tina's work.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex flex-col items-center gap-2 min-w-[200px]">
                   <Rocket className="h-8 w-8 text-emerald-400 mb-2" />
                   <span className="font-black text-2xl">COMING SOON</span>
                   <span className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-widest">Target Launch: 2026 Q3</span>
                </div>
                <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-10 h-16 rounded-2xl shadow-xl shadow-emerald-900/40">
                  <Link href="/about">
                    Contact Us for Pre-Access <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-white dark:bg-black/40">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-emerald-950 dark:text-emerald-50 uppercase tracking-tighter mb-16">
              Why Partner with LifeCreatesArt?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 { icon: TrendingUp, title: 'Affiliate Commissions', desc: 'Generous referral rewards on luxury fine art print orders and custom photo legacy album commissions.' },
                 { icon: Users, title: 'Exclusive Resources', desc: 'Gain access to premium promotional assets, curated digital flyers, and personalized support.' },
                 { icon: ShieldCheck, title: 'Inspiring Impact', desc: 'Promote a brand centering art, deep emotional resilience, and triumphant self-recreation.' }
               ].map((feature, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   viewport={{ once: true }}
                   transition={{ delay: i * 0.2 }}
                   className="p-8 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 hover:shadow-xl transition-all"
                 >
                   <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="h-8 w-8 text-emerald-600" />
                   </div>
                   <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-50 mb-4">{feature.title}</h3>
                   <p className="text-sm font-medium text-emerald-800/60 dark:text-emerald-300/40">{feature.desc}</p>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Badge({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${className}`}>
      {children}
    </span>
  );
}
