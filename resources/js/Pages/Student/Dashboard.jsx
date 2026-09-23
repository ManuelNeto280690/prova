import { IconArrow, IconCheck, IconClock, IconExam, IconShield } from '@/Components/ui/Icons';
import { container, item } from '@/Components/ui/Reveal';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router } from '@inertiajs/react';
import { motion } from 'framer-motion';

function scoreColor(score) {
    if (score >= 70) return 'text-emerald-300';
    if (score >= 50) return 'text-amber-300';
    return 'text-red-300';
}

export default function StudentDashboard({ exams }) {
    const start = (exam) => router.post(route('exam.start', exam.id));

    return (
        <StudentLayout title="Minhas provas">
            <Head title="Minhas provas" />

            {exams.length === 0 ? (
                <div className="glass flex flex-col items-center gap-4 px-6 py-16 text-center">
                    <IconExam className="h-10 w-10 text-slate-600" />
                    <div>
                        <p className="font-medium text-white">Nenhuma prova disponível</p>
                        <p className="mt-1 text-sm text-slate-500">Assim que uma prova for liberada, ela aparecerá aqui.</p>
                    </div>
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2">
                    {exams.map((e) => {
                        const finished = e.attempt?.finished;
                        return (
                            <motion.div key={e.id} variants={item} whileHover={{ y: -4 }} className="glass flex flex-col p-6">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                                        <IconExam className="h-6 w-6" />
                                    </div>
                                    {finished && (
                                        <span className={`chip border ${
                                            e.attempt.status === 'expired'
                                                ? 'border-amber-400/30 bg-amber-500/10 text-amber-300'
                                                : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                                        }`}>
                                            <IconCheck className="h-3.5 w-3.5" />
                                            {e.attempt.status === 'expired' ? 'Tempo esgotado' : 'Concluída'}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-semibold text-white">{e.title}</h3>
                                <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-400">
                                    {e.description || 'Prova de múltipla escolha.'}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5"><IconExam className="h-4 w-4" /> {e.questions_count} questões</span>
                                    <span className="flex items-center gap-1.5"><IconClock className="h-4 w-4" /> {e.duration_minutes} min</span>
                                </div>

                                <div className="mt-6 border-t border-white/5 pt-4">
                                    {finished ? (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-400">Seu resultado</span>
                                            <span className={`text-2xl font-bold ${scoreColor(e.attempt.score)}`}>{e.attempt.score}%</span>
                                        </div>
                                    ) : e.attempt?.status === 'in_progress' ? (
                                        <button onClick={() => router.get(route('exam.show', e.id))} className="btn-primary w-full">
                                            Continuar prova <IconArrow className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <button onClick={() => start(e)} className="btn-primary w-full">
                                            Começar prova <IconArrow className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                <IconShield className="mt-0.5 h-5 w-5 shrink-0 text-brand-300" />
                Ao iniciar, o cronômetro começa e <strong className="text-slate-200">não pode ser pausado</strong>.
                Cada prova pode ser feita uma única vez. Se o tempo acabar, ela é encerrada automaticamente.
            </div>
        </StudentLayout>
    );
}
