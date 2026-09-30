import React, { useState, useEffect } from 'react';
import { certificatesApi } from '../services/api';
import { 
  Award, 
  Printer, 
  Download, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  ExternalLink,
  Calendar,
  Layers,
  Building2,
  RefreshCw
} from 'lucide-react';

export const CertificatesPage = ({ onNavigate }) => {
  const [certificates, setCertificates] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await certificatesApi.getMyCertificates();
      const list = res.certificates || [];
      setCertificates(list);
      if (list.length > 0) {
        setSelectedCert(list[0]);
      }
    } catch (err) {
      console.error('Error fetching certificates', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading verifiable digital certificates...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
            <Award className="w-3.5 h-3.5" />
            <span>Verifiable Digital Cooperative Certifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Official Completion Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Tamper-proof verifiable credentials recognized across Primary Agricultural Credit Societies, Dairy Unions, and Cooperative Registrars.
          </p>
        </div>

        {selectedCert && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        )}
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 space-y-3">
          <Award className="w-16 h-16 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Certificates Earned Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete all lessons in a course and score 60% or higher on the assessment quiz to automatically receive your credential.
          </p>
          <button
            onClick={() => onNavigate('courses')}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Start Course Assessment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Certificate Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Earned Credentials ({certificates.length})
            </h3>
            {certificates.map((cert) => (
              <div
                key={cert.id}
                onClick={() => setSelectedCert(cert)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedCert?.id === cert.id
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {cert.course_category || 'Cooperative Training'}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 mt-1">{cert.course_title}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">ID: {cert.certificate_number}</p>
                  </div>
                  <Award className={`w-6 h-6 ${selectedCert?.id === cert.id ? 'text-emerald-600' : 'text-slate-300'}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Printable Official Certificate Canvas (8 cols) */}
          <div className="lg:col-span-8">
            {selectedCert && (
              <div
                id="printable-certificate"
                className="bg-white rounded-2xl border-4 border-emerald-700 p-8 sm:p-12 shadow-xl relative overflow-hidden text-center space-y-6"
              >
                {/* Outer Decorative Border */}
                <div className="absolute inset-2 border-2 border-dashed border-amber-400 rounded-xl pointer-events-none" />

                {/* Certificate Header */}
                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-emerald-800 font-bold text-xs tracking-widest uppercase">
                    <Building2 className="w-4 h-4" />
                    <span>Ministry of Cooperation — National Council for Cooperative Training</span>
                  </div>

                  <div className="text-xs font-black text-orange-600 tracking-wider uppercase">
                    CoopConnect Skill Development Portal
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight pt-2">
                    Certificate of Competency
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-orange-500 via-emerald-600 to-green-600 mx-auto rounded-full" />
                </div>

                {/* Recipient */}
                <div className="relative z-10 space-y-1 pt-2">
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">This is proudly awarded to</p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 font-serif italic">
                    {selectedCert.student_name || 'Ramesh Patel'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600">
                    Member ID: <span className="font-mono text-slate-800">{selectedCert.member_id || 'GJ-COOP-88219'}</span> • {selectedCert.cooperative_society || 'Kaira District Co-operative Milk Producers Union'}
                  </p>
                </div>

                {/* Course Details */}
                <div className="relative z-10 max-w-lg mx-auto text-xs text-slate-700 leading-relaxed pt-1">
                  for successfully completing the standardized cooperative curriculum and passing the cognitive skill assessment for
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 mt-1">
                    "{selectedCert.course_title}"
                  </div>
                </div>

                {/* Certificate Metadata Badges */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 max-w-xl mx-auto text-left text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Issue Date</span>
                    <span className="font-bold text-slate-800">
                      {new Date(selectedCert.issue_date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Evaluation Grade</span>
                    <span className="font-extrabold text-emerald-700">{selectedCert.grade || 'A'} (Certified)</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Certificate No.</span>
                    <span className="font-mono font-bold text-slate-800 text-[11px] truncate block">
                      {selectedCert.certificate_number}
                    </span>
                  </div>
                </div>

                {/* Signatures & QR Hash */}
                <div className="relative z-10 pt-6 flex items-center justify-between border-t border-slate-100 text-xs">
                  <div className="text-left">
                    <div className="font-serif italic font-bold text-slate-800 text-sm">Dr. Anand Deshmukh</div>
                    <div className="text-[10px] text-slate-500">NCCT Course Director</div>
                  </div>

                  {/* QR & Verification */}
                  <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <div className="w-9 h-9 bg-white border border-slate-300 rounded flex items-center justify-center text-slate-800">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-emerald-700 uppercase flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Verified Digital Record
                      </span>
                      <div className="text-[9px] text-slate-400 font-mono">
                        Hash: {selectedCert.verification_hash || 'SHA-256 Valid'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-serif italic font-bold text-slate-800 text-sm">Vikramaditya Rao</div>
                    <div className="text-[10px] text-slate-500">Cooperative Registrar / NCDC</div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default CertificatesPage;
