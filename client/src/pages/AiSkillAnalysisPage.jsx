import React, { useState, useEffect } from 'react';
import { aiApi } from '../services/api';
import SkillBadge from '../components/SkillBadge';
import ProgressBar from '../components/ProgressBar';
import { 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  BarChart3
} from 'lucide-react';

export const AiSkillAnalysisPage = ({ onNavigate, onSelectCourse }) => {
  const [skillsData, setSkillsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customTestInput, setCustomTestInput] = useState(false);
  const [testScores, setTestScores] = useState({
    'Cooperative Accounting': 45,
    'Digital Literacy & DBT': 85,
    'PACS Governance & Bye-laws': 65,
    'Dairy Cold Chain & Quality Control': 50
  });
  const [directAnalysisResult, setDirectAnalysisResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await aiApi.getUserSkills();
      setSkillsData(res.data);
    } catch (err) {
      console.error('Error loading AI skill analysis', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCustomAnalysis = async () => {
    setAnalyzing(true);
    try {
      const assessmentPayload = Object.entries(testScores).map(([skill, score]) => ({
        skill,
        score: Number(score)
      }));

      const res = await aiApi.analyzeSkillsDirect({
        userId: skillsData?.userId || 1,
        assessmentResults: assessmentPayload
      });

      setDirectAnalysisResult(res);
      await fetchSkills();
    } catch (err) {
      console.error('Error running direct AI analysis', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Generating AI Skill Profile & Gap Report...</p>
      </div>
    );
  }

  const allSkills = skillsData?.skills || [];
  const strengths = skillsData?.strengths || [];
  const developing = skillsData?.developing || [];
  const skillGaps = skillsData?.skillGaps || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-900/60 border border-emerald-500/30 px-3 py-1 rounded-full">
              <Cpu className="w-3.5 h-3.5" />
              <span>Modular AI Skill Engine (TensorFlow.js / Heuristic)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI Skill Proficiency & Gap Analysis
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Automated cognitive assessment evaluating your cooperative operational readiness across statutory compliance, accounting, and micro-banking.
            </p>
          </div>

          <button
            onClick={() => setCustomTestInput(!customTestInput)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition self-start md:self-auto cursor-pointer"
          >
            {customTestInput ? 'Hide AI Simulation Lab' : '🧪 Open AI Assessment Lab'}
          </button>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Interactive AI Simulation Lab Drawer */}
      {customTestInput && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BrainCircuit className="w-5 h-5 text-emerald-700" />
              <h3 className="font-bold text-sm text-emerald-950">
                Live AI Model Test Workbench (POST /api/ai/analyze-skills)
              </h3>
            </div>
            <span className="text-[11px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded">
              SIH Evaluator Sandbox
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Adjust the sliders below to simulate different assessment scores and observe instant categorization into <strong>Strong (≥80%)</strong>, <strong>Developing (60-79%)</strong>, and <strong>Skill Gaps (&lt;60%)</strong> with dynamic course recommendations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {Object.keys(testScores).map((skillName) => (
              <div key={skillName} className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 line-clamp-1">{skillName}</span>
                  <span className="font-extrabold text-emerald-700">{testScores[skillName]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={testScores[skillName]}
                  onChange={(e) => setTestScores({ ...testScores, [skillName]: Number(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleRunCustomAnalysis}
              disabled={analyzing}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{analyzing ? 'Evaluating Vectors...' : 'Execute AI Skill Engine'}</span>
            </button>
          </div>

          {directAnalysisResult && (
            <div className="p-4 bg-white rounded-xl border border-emerald-300 shadow-xs space-y-2 mt-2">
              <h4 className="text-xs font-bold text-emerald-900 uppercase">AI JSON Output:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                  <strong className="text-emerald-800">Strengths:</strong>
                  <div>{directAnalysisResult.strengths?.join(', ') || 'None'}</div>
                </div>
                <div className="p-2 bg-orange-50 rounded border border-orange-100">
                  <strong className="text-orange-800">Skill Gaps:</strong>
                  <div>{directAnalysisResult.skillGaps?.join(', ') || 'None'}</div>
                </div>
                <div className="p-2 bg-blue-50 rounded border border-blue-100">
                  <strong className="text-blue-800">Recommendations:</strong>
                  <div>{directAnalysisResult.recommendations?.length || 0} courses queued</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3 Overview Categorization Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Strong Competencies */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Strong Competencies</h3>
            </div>
            <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {strengths.length} Skills (≥ 80%)
            </span>
          </div>

          {strengths.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No skills assessed at mastery level yet.</p>
          ) : (
            <div className="space-y-3">
              {strengths.map((s, idx) => (
                <div key={idx} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-950">{s.skill_name || s.name}</span>
                    <span className="font-black text-emerald-700">{Math.round(s.score)}%</span>
                  </div>
                  <ProgressBar progress={s.score} size="sm" showLabel={false} color="emerald" />
                  <p className="text-[10px] text-emerald-800">{s.category || 'High operational proficiency'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Developing Skills */}
        <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Developing Skills</h3>
            </div>
            <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {developing.length} Skills (60-79%)
            </span>
          </div>

          {developing.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No intermediate skills recorded.</p>
          ) : (
            <div className="space-y-3">
              {developing.map((s, idx) => (
                <div key={idx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-950">{s.skill_name || s.name}</span>
                    <span className="font-black text-amber-700">{Math.round(s.score)}%</span>
                  </div>
                  <ProgressBar progress={s.score} size="sm" showLabel={false} color="amber" />
                  <p className="text-[10px] text-amber-800">Approaching mastery threshold</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Critical Skill Gaps */}
        <div className="bg-white rounded-2xl border border-orange-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-orange-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Identified Skill Gaps</h3>
            </div>
            <span className="text-xs font-black text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
              {skillGaps.length} Gaps (&lt; 60%)
            </span>
          </div>

          {skillGaps.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">No critical skill gaps identified!</p>
          ) : (
            <div className="space-y-3">
              {skillGaps.map((s, idx) => {
                const currentScore = s.score || 45;
                const gapDelta = Math.max(0, 80 - currentScore);
                return (
                  <div key={idx} className="p-3 bg-orange-50/50 rounded-xl border border-orange-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-orange-950">{s.skill_name || s.name}</span>
                      <span className="font-black text-orange-700">{Math.round(currentScore)}%</span>
                    </div>
                    <ProgressBar progress={currentScore} size="sm" showLabel={false} color="orange" />
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-orange-800 font-bold">Deficit: -{gapDelta}% to reach mastery</span>
                      <button
                        onClick={() => onNavigate('recommendations')}
                        className="text-emerald-700 font-extrabold hover:underline"
                      >
                        Bridge Gap →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Comprehensive Skill Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Cooperative Competency & Statutory Readiness Matrix</span>
          </h3>
          <p className="text-xs text-slate-500">
            Official benchmark mapping against Ministry of Cooperation guidelines
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Skill Domain</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allSkills.map((s) => (
                <tr key={s.skill_id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {s.skill_name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {s.category}
                  </td>
                  <td className="py-3 px-4 font-extrabold">
                    {s.score !== null && s.score !== undefined ? `${Math.round(s.score)}%` : 'Not Assessed'}
                  </td>
                  <td className="py-3 px-4">
                    <SkillBadge
                      status={s.proficiency_level}
                      score={s.score}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onNavigate('recommendations')}
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-xs"
                    >
                      View Targeted Courses →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AiSkillAnalysisPage;
