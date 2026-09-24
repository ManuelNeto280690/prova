import { IconAlert, IconArrow, IconCheck, IconClock, IconExam, IconShield } from '@/Components/ui/Icons';
import { container, item } from '@/Components/ui/Reveal';
import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function fmt(s) {
    if (s <= 0) return '00:00';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function scoreColor(score) {
    if (score >= 70) return 'text-emerald-300';
    if (score >= 50) return 'text-amber-300';
    return 'text-red-300';
}

export default function StudentDashboard({ exams }) {
    const [notice, setNotice] = useState(null);

    // Live countdown timer for active exams
    const [timers, setTimers] = useState(() => {
        const map = {};
        exams.forEach((e) => {
            if (e.released && e.seconds_remaining) {
                map[e.id] = e.seconds_remaining;
            }
        });
        return map;
    });

    useEffect(() => {
        const id = setInterval(() => {
            setTimers((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((k) => {
                    if (next[k] > 0) next[k] -= 1;
                });
                return next;
            });
        }, 1000);
        return () => clearInterval(id);
    }, []);

    // Auto-polling: Check every 4 seconds if professor activated the exam
    useEffect(() => {
        const hasWaiting = exams.some((e) => e.waiting_for_teacher || (e.released && !e.attempt?.finished));
        if (!hasWaiting) return;

        const pollId = setInterval(() => {
            router.reload({ only: ['exams'] });
        }, 4000);

        return () => clearInterval(pollId);
    }, [exams]);

    const start = (exam) => {
        if (!exam.released) {
            setNotice(
                exam.is_expired
                    ? `A prova "${exam.title}" já foi encerrada.`
                    : `Aguarde o professor ativar a prova "${exam.title}" no painel.`
            );
            setTimeout(() => setNotice(null), 5000);
            return;
        }
        router.post(route('exam.start', exam.id));
    };

    return (
        <StudentLayout title="Minhas provas">
            <Head title="Minhas provas" />

            {exams.length === 0 ? (
                <div className="glass flex flex-col items-center gap-4 px-6 py-16 text-center">
                    <IconExam className="h-10 w-10 text-slate-600" />
                    <div>
                        <p className="font-medium text-white">Nenhuma prova disponível</p>
                        <p className="mt-1 text-sm text-slate-500">Assim que o professor liberar uma prova, ela aparecerá aqui.</p>
                    </div>
                </div>
            ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2">
                    {exams.map((e) => {
                        const finished = e.attempt?.finished;
                        const inProgress = e.attempt?.status === 'in_progress';
                        const remaining = timers[e.id] ?? e.seconds_remaining ?? 0;
                        const isLive = e.released && remaining > 0 && !finished;
                        const waiting = e.waiting_for_teacher && !finished && !inProgress;
                        const expired = e.is_expired && !finished;

                        return (
                            <motion.div
                                key={e.id}
                                variants={item}
                                whileHover={{ y: -4 }}
                                className={`glass flex flex-col p-6 relative overflow-hidden ${
                                    isLive ? 'border-emerald-500/30' : ''
                                }`}
                            >
                                {isLive && (
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-pulse" />
                                )}

                                <div className="mb-4 flex items-start justify-between">
                                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                                        <IconExam className="h-6 w-6" />
                                    </div>

                                    {finished ? (
                                        <span className={`chip border ${
                                            e.attempt.status === 'expired'
                                                ? 'border-amber-400/30 bg-amber-500/10 text-amber-300'
                                                : 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
                                        }`}>
                                            <IconCheck className="h-3.5 w-3.5" />
                                            {e.attempt.status === 'expired' ? 'Tempo esgotado' : 'Concluída'}
                                        </span>
                                    ) : isLive ? (
                                        <span className="chip border border-emerald-400/30 bg-emerald-500/15 text-emerald-300 font-semibold flex items-center gap-1.5 animate-pulse">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                                            Ao Vivo • Liberada
                                        </span>
                                    ) : waiting ? (
                                        <span className="chip border border-amber-400/30 bg-amber-500/10 text-amber-300 flex items-center gap-1">
                                            <IconClock className="h-3.5 w-3.5" />
                                            Aguardando Professor
                                        </span>
                                    ) : expired ? (
                                        <span className="chip border border-slate-500/30 bg-slate-500/10 text-slate-400">
                                            Encerrada
                                        </span>
                                    ) : null}
                                </div>

                                <h3 className="text-lg font-semibold text-white">{e.title}</h3>
                                <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-400">
                                    {e.description || 'Prova de múltipla escolha com tempo cronometrado.'}
                                </p>

                                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5"><IconExam className="h-4 w-4" /> {e.questions_count} questões</span>
                                    <span className="flex items-center gap-1.5"><IconClock className="h-4 w-4" /> {e.duration_minutes} min</span>
                                </div>

                                {isLive && (
                                    <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-200">
                                        <span className="flex items-center gap-1.5">
                                            <IconClock className="h-4 w-4 text-emerald-300 shrink-0" />
                                            Tempo Restante Coletivo:
                                        </span>
                                        <span className="font-mono text-sm font-bold text-emerald-300">{fmt(remaining)}</span>
                                    </div>
                                )}

                                {waiting && (
                                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/5 px-3.5 py-2.5 text-xs text-amber-200">
                                        <span className="relative flex h-2 w-2 shrink-0">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        Aguardando o professor iniciar a prova no painel...
                                    </div>
                                )}

                                <div className="mt-6 border-t border-white/5 pt-4">
                                    {finished ? (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-400">Seu resultado</span>
                                            <span className={`text-2xl font-bold ${scoreColor(e.attempt.score)}`}>{e.attempt.score}%</span>
                                        </div>
                                    ) : inProgress ? (
                                        <button onClick={() => router.get(route('exam.show', e.id))} className="btn-primary w-full">
                                            Continuar prova <IconArrow className="h-4 w-4" />
                                        </button>
                                    ) : isLive ? (
                                        <button
                                            onClick={() => start(e)}
                                            className="btn-primary w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-glow flex items-center justify-center gap-2"
                                        >
                                            Entrar na Prova Agora <IconArrow className="h-4 w-4" />
                                        </button>
                                    ) : waiting ? (
                                        <button
                                            disabled
                                            className="btn w-full cursor-not-allowed border border-amber-400/20 bg-amber-500/5 text-amber-200/70"
                                        >
                                            <IconClock className="h-4 w-4" /> Aguardando Início pelo Professor
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="btn w-full cursor-not-allowed border border-white/10 bg-white/5 text-slate-400"
                                        >
                                            Prova Encerrada
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
                <span>
                    A contagem regressiva é <strong>sincronizada</strong> pelo professor.
                    Assim que ele ativar a prova, o cronômetro começa simultaneamente para todos os alunos.
                </span>
            </div>

            {/* Notificação imediata */}
            <div className="pointer-events-none fixed bottom-6 right-6 z-[60] max-w-sm">
                <AnimatePresence>
                    {notice && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="pointer-events-auto flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-200 backdrop-blur-xl shadow-card"
                        >
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-amber-500/20 text-amber-300">
                                <IconAlert className="h-4 w-4" />
                            </span>
                            {notice}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </StudentLayout>
    );
}
