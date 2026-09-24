import { IconArrow, IconChart } from '@/Components/ui/Icons';
import { container, item } from '@/Components/ui/Reveal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

const statusChip = {
    completed: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
    expired: 'border-amber-400/30 bg-amber-500/10 text-amber-300',
    in_progress: 'border-sky-400/30 bg-sky-500/10 text-sky-300',
};
const statusLabel = { completed: 'Concluída', expired: 'Tempo esgotado', in_progress: 'Em andamento' };

function scoreColor(score) {
    if (score >= 70) return 'text-emerald-300';
    if (score >= 50) return 'text-amber-300';
    return 'text-red-300';
}

export default function ExamResults({ exam, attempts }) {
    const finished = attempts.filter((a) => a.status !== 'in_progress');
    const avg = finished.length
        ? Math.round(finished.reduce((s, a) => s + a.score, 0) / finished.length)
        : 0;
    const totalViolations = attempts.reduce((acc, a) => acc + (a.violations_count || 0), 0);

    return (
        <AdminLayout
            title={exam.title}
            actions={
                <Link href={route('admin.exams.index')} className="btn-ghost">
                    <IconArrow className="h-4 w-4 rotate-180" /> Voltar
                </Link>
            }
        >
            <Head title={`Resultados — ${exam.title}`} />

            <div className="mb-6 grid gap-4 sm:grid-cols-4">
                <div className="glass p-5">
                    <p className="text-sm text-slate-400">Realizadas</p>
                    <p className="mt-1 text-3xl font-bold text-white">{finished.length}</p>
                </div>
                <div className="glass p-5">
                    <p className="text-sm text-slate-400">Média geral</p>
                    <p className={`mt-1 text-3xl font-bold ${scoreColor(avg)}`}>{avg}%</p>
                </div>
                <div className="glass p-5">
                    <p className="text-sm text-slate-400">Alertas de Tela/Aba</p>
                    <p className={`mt-1 text-3xl font-bold ${totalViolations > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {totalViolations}
                    </p>
                </div>
                <div className="glass p-5">
                    <p className="text-sm text-slate-400">Tempo limite</p>
                    <p className="mt-1 text-3xl font-bold text-white">{exam.duration_minutes} min</p>
                </div>
            </div>

            <div className="glass overflow-hidden">
                <div className="border-b border-white/10 px-6 py-4">
                    <h2 className="font-semibold text-white">Desempenho por aluno</h2>
                </div>

                {attempts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                        <IconChart className="h-8 w-8 text-slate-600" />
                        <p className="text-sm text-slate-500">Nenhum aluno realizou esta prova ainda.</p>
                    </div>
                ) : (
                    <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-white/5">
                        {attempts.map((a) => (
                            <motion.div key={a.id} variants={item}
                                className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-200">
                                        {a.student?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{a.student}</p>
                                        <p className="text-sm text-slate-500">{a.email}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">Acertos</p>
                                        <p className="text-sm font-medium text-slate-300">{a.correct_count}/{a.total_questions}</p>
                                    </div>

                                    {a.violations_count > 0 ? (
                                        <span className="chip border border-red-500/40 bg-red-500/15 text-red-300 font-semibold" title="Aluno saiu da tela cheia ou alternou de aba">
                                            ⚠️ {a.violations_count} {a.violations_count === 1 ? 'saída' : 'saídas'}
                                        </span>
                                    ) : (
                                        <span className="chip border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
                                            0 infrações
                                        </span>
                                    )}

                                    <span className={`chip border ${statusChip[a.status]}`}>{statusLabel[a.status]}</span>
                                    <span className={`w-14 text-right text-2xl font-bold ${scoreColor(a.score)}`}>
                                        {a.status === 'in_progress' ? '—' : `${a.score}%`}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </AdminLayout>
    );
}
