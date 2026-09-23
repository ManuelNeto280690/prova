import { IconCopy, IconKey, IconPlus, IconShield, IconTrash, IconUsers } from '@/Components/ui/Icons';
import { container, item } from '@/Components/ui/Reveal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

function CredentialModal({ credential, onClose }) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard?.writeText(
            `E-mail: ${credential.email}\nSenha: ${credential.password}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {credential && (
                <motion.div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-5 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        onClick={(e) => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: 12 }}
                        className="glass-strong w-full max-w-md p-7"
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300">
                                <IconKey className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Credenciais geradas</h3>
                                <p className="text-sm text-slate-400">Copie e envie ao aluno agora.</p>
                            </div>
                        </div>

                        <div className="space-y-3 rounded-xl border border-white/10 bg-ink-900/60 p-4">
                            <Field label="Aluno" value={credential.name} />
                            <Field label="E-mail" value={credential.email} mono />
                            <Field label="Senha temporária" value={credential.password} mono highlight />
                        </div>

                        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/90">
                            <IconShield className="mt-0.5 h-4 w-4 shrink-0" />
                            Esta senha só aparece uma vez. O aluno será obrigado a trocá-la no primeiro acesso.
                        </div>

                        <div className="mt-5 flex gap-3">
                            <button onClick={copy} className="btn-ghost flex-1">
                                <IconCopy className="h-4 w-4" />
                                {copied ? 'Copiado!' : 'Copiar'}
                            </button>
                            <button onClick={onClose} className="btn-primary flex-1">Concluir</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const Field = ({ label, value, mono, highlight }) => (
    <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-slate-400">{label}</span>
        <span className={`text-sm ${mono ? 'font-mono' : ''} ${highlight ? 'font-bold text-emerald-300' : 'text-white'}`}>
            {value}
        </span>
    </div>
);

export default function StudentsIndex({ students }) {
    const { flash } = usePage().props;
    const [credential, setCredential] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({ name: '', email: '' });

    useEffect(() => {
        if (flash?.generatedCredential) setCredential(flash.generatedCredential);
    }, [flash?.generatedCredential]);

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.students.store'), { onSuccess: () => reset() });
    };

    const remove = (student) => {
        if (confirm(`Remover o aluno "${student.name}"? Esta ação não pode ser desfeita.`)) {
            router.delete(route('admin.students.destroy', student.id), { preserveScroll: true });
        }
    };

    const resetPass = (student) => {
        if (confirm(`Gerar nova senha para "${student.name}"?`)) {
            router.post(route('admin.students.reset', student.id), {}, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout title="Alunos">
            <Head title="Alunos — Admin" />

            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
                {/* Create form */}
                <div className="glass h-fit p-6">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                            <IconPlus className="h-5 w-5" />
                        </div>
                        <h2 className="font-semibold text-white">Cadastrar aluno</h2>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="label" htmlFor="name">Nome completo</label>
                            <input id="name" className="input" value={data.name}
                                onChange={(e) => setData('name', e.target.value)} placeholder="Maria Silva" />
                            {errors.name && <p className="mt-1.5 text-sm text-red-400">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="email">E-mail</label>
                            <input id="email" type="email" className="input" value={data.email}
                                onChange={(e) => setData('email', e.target.value)} placeholder="maria@exemplo.com" />
                            {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
                        </div>
                        <button type="submit" disabled={processing} className="btn-primary w-full">
                            {processing ? 'Cadastrando…' : 'Cadastrar e gerar senha'}
                        </button>
                        <p className="text-xs text-slate-500">
                            Uma senha segura é gerada automaticamente e enviada por e-mail (quando configurado).
                        </p>
                    </form>
                </div>

                {/* List */}
                <div className="glass overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                        <h2 className="font-semibold text-white">Alunos cadastrados</h2>
                        <span className="chip bg-white/5 text-slate-300">{students.length}</span>
                    </div>

                    {students.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                            <IconUsers className="h-8 w-8 text-slate-600" />
                            <p className="text-sm text-slate-500">Nenhum aluno cadastrado ainda.</p>
                        </div>
                    ) : (
                        <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-white/5">
                            {students.map((s) => (
                                <motion.div key={s.id} variants={item}
                                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-500/15 text-sm font-bold text-brand-200">
                                            {s.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{s.name}</p>
                                            <p className="text-sm text-slate-500">{s.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="chip bg-white/5 text-slate-400">
                                            {s.finished_attempts} prova(s)
                                        </span>
                                        {s.must_change_password && (
                                            <span className="chip border border-amber-400/30 bg-amber-500/10 text-amber-300">
                                                senha pendente
                                            </span>
                                        )}
                                        <button onClick={() => resetPass(s)} title="Gerar nova senha"
                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-brand-300">
                                            <IconKey className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => remove(s)} title="Remover"
                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-300">
                                            <IconTrash className="h-4 w-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            <CredentialModal credential={credential} onClose={() => setCredential(null)} />
        </AdminLayout>
    );
}
