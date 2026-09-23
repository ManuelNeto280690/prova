import { IconAlert, IconArrow, IconCheck } from '@/Components/ui/Icons';
import Reveal from '@/Components/ui/Reveal';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

function scoreColor(score) {
    if (score >= 70) return 'text-emerald-300';
    if (score >= 50) return 'text-amber-300';
    return 'text-red-300';
}

export default function ExamResult({ exam, result }) {
    const expired = result.status === 'expired';
    const pct = result.score;
    const circumference = 2 * Math.PI * 52;

    return (
        <StudentLayout>
            <Head title={`Resultado — ${exam.title}`} />

            <Reveal className="mx-auto max-w-lg">
                <div className="glass-strong overflow-hidden p-8 text-center">
                    <span className={`chip mx-auto border ${
                        expired
                            ? 'border-amber-400/30 bg-amber-500/10 text-amber-300'
                            : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                    }`}>
                        {expired ? <IconAlert className="h-3.5 w-3.5" /> : <IconCheck className="h-3.5 w-3.5" />}
                        {expired ? 'Encerrada por tempo' : 'Prova concluída'}
                    </span>

                    <h1 className="mt-4 text-xl font-bold text-white">{exam.title}</h1>

                    {/* Score ring */}
                    <div className="relative mx-auto mt-8 h-40 w-40">
                        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                            <motion.circle
                                cx="60" cy="60" r="52" fill="none"
                                stroke="currentColor" strokeWidth="10" strokeLinecap="round"
                                className={scoreColor(pct)}
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: circumference - (pct / 100) * circumference }}
                                transition={{ duration: 1.1, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 grid place-items-center">
                            <motion.span
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className={`text-4xl font-extrabold ${scoreColor(pct)}`}
                            >
                                {pct}%
                            </motion.span>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-ink-900/50 p-4">
                            <p className="text-2xl font-bold text-white">{result.correct_count}/{result.total_questions}</p>
                            <p className="text-xs text-slate-500">Acertos</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-ink-900/50 p-4">
                            <p className="text-2xl font-bold text-white">{result.finished_at}</p>
                            <p className="text-xs text-slate-500">Finalizada em</p>
                        </div>
                    </div>

                    <Link href={route('student.dashboard')} className="btn-ghost mt-8 w-full">
                        Voltar para minhas provas <IconArrow className="h-4 w-4" />
                    </Link>
                </div>
            </Reveal>
        </StudentLayout>
    );
}
