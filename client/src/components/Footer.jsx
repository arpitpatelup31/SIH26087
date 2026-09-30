import React from 'react';
import { Shield, Award, Cpu, BookCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                C
              </div>
              <span className="text-base font-bold text-white tracking-tight">CoopConnect LMS</span>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                SIH26087
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              AI-driven learning and competency management system designed for Primary Agricultural Credit Societies (PACS), Dairy Unions, Handloom Cooperatives, and DCCBs.
            </p>
            <div className="flex items-center space-x-4 pt-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Ministry Aligned</span>
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-amber-400" /> Edge SQLite Ready</span>
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-blue-400" /> Verifiable Certs</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Cooperative Domains</h4>
            <ul className="space-y-2 text-slate-400">
              <li>• PACS Digital Accounting</li>
              <li>• Dairy Cold Chain & AMCUs</li>
              <li>• KCC & Micro-Banking</li>
              <li>• Cooperative Bye-laws & Audits</li>
              <li>• Handloom & Artisan SHGs</li>
            </ul>
          </div>

          {/* Offline Architecture Badge */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Edge Sync Architecture</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
              Equipped with offline local queue storage for remote rural cooperative branches and Raspberry Pi edge hubs.
            </p>
            <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 text-[11px]">
              <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Offline-First Engine Active
              </div>
              <div className="text-slate-400 text-[10px] mt-0.5">Sync queue automatically commits to cloud on reconnect.</div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
          <p>© 2026 CoopConnect — Smart India Hackathon 2026 Solution for PS SIH26087.</p>
          <p className="mt-2 sm:mt-0 text-slate-400">Built for Ministry of Cooperation & NCCT Training Mandates</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
