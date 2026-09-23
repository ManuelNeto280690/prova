import { IconArrow, IconShield } from '@/Components/ui/Icons';
import Reveal from '@/Components/ui/Reveal';
import { Head, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Entrar" />
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" />

                <Reveal className="relative w-full max-w-md">
                    <div className="glass-strong p-8 sm:p-10">
                        <div className="mb-8 flex flex-col items-center text-center">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                                <IconShield className="h-7 w-7" />
                            </div>
                            <h1 className="mt-5 text-2xl font-bold text-white">Bem-vindo de volta</h1>
                            <p className="mt-1 text-sm text-slate-400">Entre com suas credenciais de acesso</p>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="label" htmlFor="email">E-mail</label>
                                <input
                                    id="email"
                                    type="email"
                                    className="input"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    placeholder="voce@exemplo.com"
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <p className="mt-1.5 text-sm text-red-400">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="label" htmlFor="password">Senha</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="input"
                                    value={data.password}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>}
                            </div>

                            <label className="flex items-center gap-2 text-sm text-slate-400">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-white/20 bg-ink-900 text-brand-500 focus:ring-brand-400/40"
                                />
                                Manter conectado
                            </label>

                            <button type="submit" disabled={processing} className="btn-primary w-full py-3 text-base">
                                {processing ? 'Entrando…' : 'Entrar'}
                                {!processing && <IconArrow className="h-5 w-5" />}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-xs text-slate-500">
                            Não tem acesso? Solicite ao administrador da plataforma.
                        </p>
                    </div>
                </Reveal>
            </div>
        </>
    );
}
