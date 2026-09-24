import { IconAlert, IconCheck, IconClock, IconShield } from '@/Components/ui/Icons';
import { Head, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

function fmt(s) {
    if (s <= 0) return '00:00';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function ExamTake({ exam, questions, secondsRemaining, violationsCount = 0 }) {
    const [remaining, setRemaining] = useState(secondsRemaining);
    const [answers, setAnswers] = useState({});
    const [timeUp, setTimeUp] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const finishedRef = useRef(false); // guards against double submit

    // Security states
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [violations, setViolations] = useState(violationsCount);
    const [warningToast, setWarningToast] = useState(null);
    const toastTimeoutRef = useRef(null);

    const answeredCount = Object.keys(answers).length;
    const total = questions.length;
    const allAnswered = answeredCount === total;
    const lowTime = remaining <= 60 && remaining > 0;

    const showWarning = useCallback((msg) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setWarningToast(msg);
        toastTimeoutRef.current = setTimeout(() => {
            setWarningToast(null);
        }, 3500);
    }, []);

    // Record violation on server and client
    const recordViolation = useCallback((reason) => {
        if (finishedRef.current) return;
        setViolations((prev) => {
            const next = prev + 1;
            window.axios.post(route('exam.violation', exam.id)).catch(() => {});
            return next;
        });
        showWarning(`⚠️ Infrações registradas: ${reason}`);
    }, [exam.id, showWarning]);

    // Request Fullscreen
    const enterFullscreen = () => {
        const el = document.documentElement;
        if (el.requestFullscreen) {
            el.requestFullscreen().catch(() => {});
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
        }
        setIsFullscreen(true);
        setHasStarted(true);
    };

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            const inFs = Boolean(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );
            setIsFullscreen(inFs);

            if (!inFs && hasStarted && !finishedRef.current) {
                recordViolation('Saída do modo tela cheia!');
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [hasStarted, recordViolation]);

    // Tab visibility & Window blur listener (detect tab switches)
    useEffect(() => {
        if (!hasStarted) return;

        const handleVisibilityChange = () => {
            if (document.hidden && !finishedRef.current) {
                recordViolation('Troca de aba / navegador minimizado!');
            }
        };

        const handleWindowBlur = () => {
            if (!finishedRef.current) {
                recordViolation('Foco da janela perdido / clique fora do navegador!');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [hasStarted, recordViolation]);

    // Keyboard Shortcuts Blocker (F12, DevTools, Ctrl+C, Ctrl+V, etc.)
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Block F12 (Inspect)
            if (e.key === 'F12') {
                e.preventDefault();
                showWarning('Tecla F12 (Inspecionar) desativada.');
                return;
            }

            // Block DevTools shortcuts (Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)) {
                e.preventDefault();
                showWarning('Ferramentas de desenvolvedor desativadas.');
                return;
            }

            // Block View Source (Ctrl+U)
            if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
                showWarning('Visualização de código fonte desativada.');
                return;
            }

            // Block Copy, Paste, Cut, Select All, Print, Save
            if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'v', 'V', 'x', 'X', 'a', 'A', 'p', 'P', 's', 'S'].includes(e.key)) {
                e.preventDefault();
                showWarning('Atalho bloqueado: cópia e colagem não são permitidas nesta prova.');
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showWarning]);

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

        window.axios
            .post(route('exam.submit', exam.id), {
                answers,
                auto: true,
                violations_count: violations,
            })
            .catch(() => {})
            .finally(() => {
                setTimeout(() => router.post(route('logout')), 3200);
            });
    }, [answers, exam.id, violations]);

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
            { answers, auto: false, violations_count: violations },
            { onFinish: () => setSubmitting(false) }
        );
    };

    return (
        <div
            className="min-h-screen select-none bg-ink-950 text-slate-100"
            onContextMenu={(e) => {
                e.preventDefault();
                showWarning('Menu de contexto (botão direito) desativado.');
            }}
            onCopy={(e) => {
                e.preventDefault();
                showWarning('Cópia de conteúdo desativada.');
            }}
            onCut={(e) => {
                e.preventDefault();
                showWarning('Ação de cortar desativada.');
            }}
            onPaste={(e) => {
                e.preventDefault();
                showWarning('Ação de colar desativada.');
            }}
        >
            <Head title={exam.title} />

            {/* Sticky responsive exam header with timer & violations badge */}
            <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-900/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-3">
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                            <IconShield className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate font-semibold text-white text-sm sm:text-base">{exam.title}</p>
                            <p className="text-[11px] sm:text-xs text-slate-400">{answeredCount} de {total} respondidas</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {violations > 0 && (
                            <span className="chip border border-red-500/40 bg-red-500/15 text-[11px] sm:text-xs font-semibold text-red-300 px-2 py-0.5 sm:px-2.5 sm:py-1">
                                ⚠️ {violations}
                            </span>
                        )}

                        <motion.div
                            animate={lowTime ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                            transition={{ repeat: lowTime ? Infinity : 0, duration: 1 }}
                            className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border px-2.5 py-1.5 sm:px-3.5 sm:py-2 font-mono text-sm sm:text-lg font-bold tabular-nums ${
                                lowTime
                                    ? 'animate-pulse-ring border-red-500/40 bg-red-500/10 text-red-300'
                                    : 'border-white/10 bg-white/[0.04] text-white'
                            }`}
                        >
                            <IconClock className="h-4 w-4 sm:h-5 sm:w-5" />
                            {fmt(remaining)}
                        </motion.div>
                    </div>
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

            {/* Security Warning Floating Toast */}
            <AnimatePresence>
                {warningToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-16 sm:top-20 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-red-500/40 bg-red-950/95 px-4 py-2 text-xs sm:text-sm font-medium text-red-200 shadow-2xl backdrop-blur-md max-w-[90vw] text-center"
                    >
                        {warningToast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Low-time warning banner */}
            <AnimatePresence>
                {lowTime && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-red-500/20 bg-red-500/10"
                    >
                        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm font-medium text-red-200">
                            <IconAlert className="h-4 w-4 shrink-0" />
                            Atenção: menos de 1 minuto! A prova será encerrada automaticamente ao zerar.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Questions container */}
            <main className="mx-auto max-w-3xl px-3.5 py-5 sm:px-6 sm:py-8">
                <div className="space-y-4 sm:space-y-6">
                    {questions.map((q, qi) => (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: qi * 0.03 }}
                            className="glass p-4 sm:p-6 rounded-2xl"
                        >
                            <div className="mb-3.5 sm:mb-4 flex items-start gap-2.5 sm:gap-3">
                                <span className="grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-lg bg-brand-500/15 text-xs sm:text-sm font-bold text-brand-200 mt-0.5">
                                    {qi + 1}
                                </span>
                                <p className="font-medium text-white text-sm sm:text-base leading-relaxed whitespace-pre-line">
                                    {q.statement}
                                </p>
                            </div>

                            <div className="space-y-2 sm:space-y-2.5">
                                {q.options.map((o, oi) => {
                                    const selected = answers[q.id] === o.id;
                                    return (
                                        <button
                                            key={o.id}
                                            onClick={() => select(q.id, o.id)}
                                            disabled={timeUp}
                                            className={`flex w-full items-start gap-3 rounded-xl border p-3 sm:p-3.5 text-left transition-all ${
                                                selected
                                                    ? 'border-brand-400/50 bg-brand-500/15 text-white shadow-glow'
                                                    : 'border-white/10 bg-ink-900/40 text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <span className={`grid h-6 w-6 sm:h-7 sm:w-7 shrink-0 place-items-center rounded-lg border text-xs font-bold mt-0.5 ${
                                                selected ? 'border-brand-300 bg-brand-500 text-white' : 'border-white/15 text-slate-400'
                                            }`}>
                                                {selected ? <IconCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : String.fromCharCode(65 + oi)}
                                            </span>
                                            <span className="text-xs sm:text-sm leading-relaxed pt-0.5 break-words flex-1">
                                                {o.text}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Submit Sticky Bottom Action Bar */}
                <div className="glass sticky bottom-3 sm:bottom-4 mt-6 flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl sm:flex-row sm:items-center sm:justify-between shadow-2xl backdrop-blur-2xl border-white/15">
                    <p className="text-xs sm:text-sm text-slate-300">
                        {allAnswered
                            ? '✅ Todas as questões respondidas. Pode finalizar.'
                            : `Responda todas as questões para enviar (${answeredCount}/${total}).`}
                    </p>
                    <button
                        onClick={submit}
                        disabled={!allAnswered || submitting || timeUp}
                        className="btn-primary w-full sm:w-auto px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold"
                    >
                        {submitting ? 'Enviando…' : 'Finalizar e enviar prova'}
                    </button>
                </div>
            </main>

            {/* Mandatory Fullscreen Prompt (Initial Start) */}
            <AnimatePresence>
                {!hasStarted && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-md overflow-y-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="glass-strong w-full max-w-lg p-5 sm:p-8 text-center rounded-2xl border border-white/10"
                        >
                            <div className="mx-auto mb-4 grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-brand-500/20 text-brand-300">
                                <IconShield className="h-7 w-7 sm:h-8 sm:w-8" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-white">Ambiente Seguro de Avaliação</h2>
                            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                                Para garantir a integridade da prova, o modo <strong>Tela Cheia</strong> é obrigatório.
                                Cópia de texto, botão direito e atalhos estão desativados.
                            </p>
                            <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 sm:p-3.5 text-left text-xs text-amber-200">
                                <p className="font-semibold">⚠️ Regras de Segurança:</p>
                                <ul className="mt-1 list-disc pl-4 space-y-1 text-slate-300">
                                    <li>Não saia da tela cheia nem minimize o navegador.</li>
                                    <li>Não alterne entre abas ou programas.</li>
                                    <li>Todas as tentativas de saída são gravadas e enviadas ao professor.</li>
                                </ul>
                            </div>
                            <button
                                onClick={enterFullscreen}
                                className="btn-primary mt-5 sm:mt-6 w-full py-3 sm:py-3.5 text-sm sm:text-base font-semibold shadow-glow"
                            >
                                Entrar em Tela Cheia e Iniciar Prova
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mandatory Fullscreen Restore Overlay (If student exits Fullscreen mid-exam) */}
            <AnimatePresence>
                {hasStarted && !isFullscreen && !timeUp && !finishedRef.current && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6 backdrop-blur-lg overflow-y-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass-strong w-full max-w-md border border-red-500/40 p-5 sm:p-8 text-center shadow-2xl rounded-2xl"
                        >
                            <div className="mx-auto mb-3.5 grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-red-500/20 text-red-300">
                                <IconAlert className="h-7 w-7 sm:h-8 sm:w-8" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-white">Tela Cheia Interrompida!</h3>
                            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                                Você saiu do modo tela cheia obrigatório. Esta saída foi registrada no relatório do professor.
                            </p>
                            <div className="mt-3.5 rounded-xl bg-red-500/10 py-2 text-xs font-semibold text-red-300 border border-red-500/20">
                                Total de alertas registrados: {violations}
                            </div>
                            <button
                                onClick={enterFullscreen}
                                className="btn-primary mt-5 w-full py-3 text-sm sm:text-base font-semibold"
                            >
                                Retornar para Tela Cheia
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Time-up modal */}
            <AnimatePresence>
                {timeUp && (
                    <motion.div
                        className="fixed inset-0 z-50 grid place-items-center bg-black/80 px-4 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="glass-strong w-full max-w-md p-6 sm:p-8 text-center rounded-2xl"
                        >
                            <div className="mx-auto mb-4 grid h-14 w-14 sm:h-16 sm:w-16 place-items-center rounded-2xl bg-red-500/15 text-red-300">
                                <IconAlert className="h-7 w-7 sm:h-8 sm:w-8" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold text-white">Tempo esgotado</h2>
                            <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                                Sua prova foi encerrada e enviada automaticamente. Suas respostas
                                foram registradas. Você será desconectado da plataforma.
                            </p>
                            <div className="mt-5 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-500">
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
