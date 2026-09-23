import { IconCheck, IconClock, IconPlus, IconShield, IconTrash } from '@/Components/ui/Icons';
import Reveal from '@/Components/ui/Reveal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';

const blankQuestion = () => ({
    statement: '',
    correct_index: 0,
    options: [{ text: '' }, { text: '' }],
});

export default function ExamEditor({ exam, locked }) {
    const isEdit = Boolean(exam);

    const { data, setData, post, put, processing, errors } = useForm({
        title: exam?.title ?? '',
        description: exam?.description ?? '',
        duration_minutes: exam?.duration_minutes ?? 30,
        is_published: exam?.is_published ?? false,
        questions: exam?.questions?.length ? exam.questions : [blankQuestion()],
    });

    const submit = (e) => {
        e.preventDefault();
        isEdit ? put(route('admin.exams.update', exam.id)) : post(route('admin.exams.store'));
    };

    // ---- question helpers ----
    const setQuestions = (qs) => setData('questions', qs);

    const addQuestion = () => setQuestions([...data.questions, blankQuestion()]);
    const removeQuestion = (qi) => setQuestions(data.questions.filter((_, i) => i !== qi));

    const updateQuestion = (qi, patch) =>
        setQuestions(data.questions.map((q, i) => (i === qi ? { ...q, ...patch } : q)));

    const addOption = (qi) =>
        updateQuestion(qi, { options: [...data.questions[qi].options, { text: '' }] });

    const removeOption = (qi, oi) => {
        const q = data.questions[qi];
        if (q.options.length <= 2) return;
        const options = q.options.filter((_, i) => i !== oi);
        let correct = q.correct_index;
        if (oi === correct) correct = 0;
        else if (oi < correct) correct -= 1;
        updateQuestion(qi, { options, correct_index: correct });
    };

    const updateOption = (qi, oi, text) => {
        const options = data.questions[qi].options.map((o, i) => (i === oi ? { text } : o));
        updateQuestion(qi, { options });
    };

    return (
        <AdminLayout title={isEdit ? 'Editar prova' : 'Nova prova'}>
            <Head title={isEdit ? 'Editar prova' : 'Nova prova'} />

            <form onSubmit={submit} className="space-y-6">
                {/* Meta */}
                <Reveal className="glass p-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="label">Título da prova</label>
                            <input className="input" value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Ex.: Avaliação de Matemática — Módulo 1" />
                            {errors.title && <p className="mt-1.5 text-sm text-red-400">{errors.title}</p>}
                        </div>
                        <div className="sm:col-span-2">
                            <label className="label">Descrição (opcional)</label>
                            <textarea className="input" rows={2} value={data.description ?? ''}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Instruções gerais para o aluno." />
                        </div>
                        <div>
                            <label className="label flex items-center gap-1.5">
                                <IconClock className="h-4 w-4" /> Tempo limite (minutos)
                            </label>
                            <input type="number" min={1} max={600} className="input"
                                value={data.duration_minutes}
                                onChange={(e) => setData('duration_minutes', parseInt(e.target.value || '0', 10))} />
                            {errors.duration_minutes && <p className="mt-1.5 text-sm text-red-400">{errors.duration_minutes}</p>}
                        </div>
                        <div className="flex items-end">
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3">
                                <input type="checkbox" checked={data.is_published}
                                    onChange={(e) => setData('is_published', e.target.checked)}
                                    className="rounded border-white/20 bg-ink-900 text-brand-500 focus:ring-brand-400/40" />
                                <span className="text-sm text-slate-200">Publicar (visível aos alunos)</span>
                            </label>
                        </div>
                    </div>
                </Reveal>

                {locked && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-200/90">
                        <IconShield className="mt-0.5 h-5 w-5 shrink-0" />
                        Esta prova já possui tentativas de alunos. Por integridade, as questões
                        estão bloqueadas — você só pode editar título, descrição, tempo e publicação.
                    </div>
                )}

                {/* Questions */}
                {!locked && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">Questões</h2>
                            <span className="chip bg-white/5 text-slate-400">{data.questions.length}</span>
                        </div>

                        {typeof errors.questions === 'string' && (
                            <p className="text-sm text-red-400">{errors.questions}</p>
                        )}

                        <AnimatePresence initial={false}>
                            {data.questions.map((q, qi) => (
                                <motion.div key={qi} layout
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    className="glass p-6">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="chip bg-brand-500/15 text-brand-200">Questão {qi + 1}</span>
                                        {data.questions.length > 1 && (
                                            <button type="button" onClick={() => removeQuestion(qi)}
                                                className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300">
                                                <IconTrash className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>

                                    <textarea className="input mb-4" rows={2} value={q.statement}
                                        onChange={(e) => updateQuestion(qi, { statement: e.target.value })}
                                        placeholder="Digite o enunciado da questão" />
                                    {errors[`questions.${qi}.statement`] && (
                                        <p className="-mt-2 mb-3 text-sm text-red-400">{errors[`questions.${qi}.statement`]}</p>
                                    )}

                                    <p className="label">Alternativas <span className="text-slate-500">(marque a correta)</span></p>
                                    <div className="space-y-2">
                                        {q.options.map((o, oi) => {
                                            const correct = q.correct_index === oi;
                                            return (
                                                <div key={oi} className="flex items-center gap-2">
                                                    <button type="button" onClick={() => updateQuestion(qi, { correct_index: oi })}
                                                        title="Marcar como correta"
                                                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition ${
                                                            correct
                                                                ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-300'
                                                                : 'border-white/10 bg-ink-900/50 text-slate-600 hover:text-slate-400'
                                                        }`}>
                                                        <IconCheck className="h-4 w-4" />
                                                    </button>
                                                    <input className="input flex-1" value={o.text}
                                                        onChange={(e) => updateOption(qi, oi, e.target.value)}
                                                        placeholder={`Alternativa ${String.fromCharCode(65 + oi)}`} />
                                                    {q.options.length > 2 && (
                                                        <button type="button" onClick={() => removeOption(qi, oi)}
                                                            className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-300">
                                                            <IconTrash className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {q.options.length < 6 && (
                                        <button type="button" onClick={() => addOption(qi)}
                                            className="mt-3 text-sm font-medium text-brand-300 hover:text-brand-200">
                                            + Adicionar alternativa
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <button type="button" onClick={addQuestion}
                            className="btn-ghost w-full border-dashed py-3">
                            <IconPlus className="h-4 w-4" /> Adicionar questão
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Link href={route('admin.exams.index')} className="btn-ghost">Cancelar</Link>
                    <button type="submit" disabled={processing} className="btn-primary px-6">
                        {processing ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar prova'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
