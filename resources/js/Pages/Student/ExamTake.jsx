import { IconAlert, IconCheck, IconClock, IconShield } from '@/Components/ui/Icons';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function ExamTake({ exam, questions, secondsRemaining }) {
    const [remaining, setRemaining] = useState(secondsRemaining);
    const [answers, setAnswers] = useState({});
    const [timeUp, setTimeUp] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const finishedRef = useRef(false); // guards against double submit

    const answeredCount = Object.keys(answers).length;
    const total = questions.length;
    const allAnswered = answeredCount === total;
    const lowTime = remaining <= 60 && remaining > 0;

    // ---- Timer (server-authoritative starting point, counts down locally) ----
    useEffect(() => {
        if (finishedRef.current) return;
        const id = setInterval(() => {
            setRemaining((r) => {
                if (r <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return r - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, []);

    // ---- Auto finish + logout when time is up ----
    const autoFinish = useCallback(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        setTimeUp(true);

        // Persist the attempt as expired, then log the student out.
        window.axios
            .post(route('exam.submit', exam.id), { answers, auto: true })
            .catch(() => {})
            .finally(() => {
                setTimeout(() => router.post(route('logout')), 3200);
            });
    }, [answers, exam.id]);

    useEffect(() => {
        if (remaining <= 0 && !finishedRef.current) autoFinish();
    }, [remaining, autoFinish]);

    // ---- Warn before leaving mid-exam ----
    useEffect(() => {
        const handler = (e) => {
            if (!finishedRef.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, []);

    const select = (questionId, optionId) =>
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));

    const submit = () => {
        if (!allAnswered || finishedRef.current) return;
        finishedRef.current = true;
        setSubmitting(true);
        router.post(
            route('exam.submit', exam.id),
            { answers, auto: false },
            { onFinish: () => setSubmitting(false) }
        );
    };

    return (
        <div className="min-h-screen">
            <Head title={exam.title} />

            {/* Sticky exam header with timer */}
            <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-900/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                            <IconShield className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-white">{exam.title}</p>
                            <p className="text-xs text-slate-500">{answeredCount} de {total} respondidas</p>
                        </div>
                    </div>

                    <motion.div
                        animate={lowTime ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                        transition={{ repeat: lowTime ? Infinity : 0, duration: 1 }}
                        className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-lg font-bold tabular-nums ${
                            lowTime
                                ? 'animate-pulse-ring border-red-500/40 bg-red-500/10 text-red-300'
                                : 'border-white/10 bg-white/[0.04] text-white'
                        }`}
                    >
                        <IconClock className="h-5 w-5" />
                        {fmt(remaining)}
                    </motion.div>
                </div>

                {/* Progress bar */}
                <div className="h-1 w-full bg-white/5">
                    <motion.div
                        className="h-full bg-gradient-to-r from-brand-500 to-brand-400"
                        animate={{ width: `${(answeredCount / total) * 100}%` }}
                        transition={{ ease: 'easeOut' }}
                    />
                </div>
            </header>

            {/* Low-time warning banner */}
            <AnimatePresence>
                {lowTime && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-red-500/20 bg-red-500/10"
                    >
                        <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-2.5 text-sm font-medium text-red-200">
                            <IconAlert className="h-4 w-4" />
                            Atenção: menos de 1 minuto! A prova será encerrada automaticamente ao zerar.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Questions */}
            <main className="mx-auto max-w-3xl px-5 py-8">
                <div className="space-y-5">
                    {questions.map((q, qi) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: qi * 0.04 }}
                            className="glass p-6"
                        >
                            <div className="mb-4 flex items-start gap-3">
                                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-sm font-bold text-brand-200">
                                    {qi + 1}
                                </span>
                                <p className="pt-0.5 font-medium text-white">{q.statement}</p>
                            </div>

                            <div className="space-y-2.5">
                                {q.options.map((o, oi) => {
                                    const selected = answers[q.id] === o.id;
                                    return (
                                        <button
                                            key={o.id}
                                            onClick={() => select(q.id, o.id)}
                                            disabled={timeUp}
                                            className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                                                selected
                                                    ? 'border-brand-400/50 bg-brand-500/15 text-white shadow-glow'
                                                    : 'border-white/10 bg-ink-900/40 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-xs font-bold ${
                                                selected ? 'border-brand-300 bg-brand-500 text-white' : 'border-white/15 text-slate-400'
                                            }`}>
                                                {selected ? <IconCheck className="h-4 w-4" /> : String.fromCharCode(65 + oi)}
                                            </span>
                                            {o.text}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Submit */}
                <div className="glass sticky bottom-4 mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-400">
                        {allAnswered
                            ? 'Todas as questões respondidas. Você pode finalizar.'
                            : `Responda todas as questões para finalizar (${answeredCount}/${total}).`}
                    </p>
                    <button
                        onClick={submit}
                        disabled={!allAnswered || submitting || timeUp}
                        className="btn-primary px-6"
                    >
                        {submitting ? 'Enviando…' : 'Finalizar e enviar'}
                    </button>
                </div>
            </main>

            {/* Time-up modal */}
            <AnimatePresence>
                {timeUp && (
                    <motion.div
                        className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-5 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="glass-strong w-full max-w-md p-8 text-center"
                        >
                            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-red-500/15 text-red-300">
                                <IconAlert className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Tempo esgotado</h2>
                            <p className="mt-2 text-sm text-slate-400">
                                Sua prova foi encerrada e enviada automaticamente. Suas respostas
                                foram registradas. Você será desconectado da plataforma.
                            </p>
                            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
                                <span className="h-2 w-2 animate-ping rounded-full bg-brand-400" />
                                Encerrando sessão…
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
