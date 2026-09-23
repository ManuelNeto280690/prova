import { IconKey } from '@/Components/ui/Icons';
import Reveal from '@/Components/ui/Reveal';
import { Head, useForm } from '@inertiajs/react';

export default function FirstAccess() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('first-access.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Primeiro acesso" />
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" />

                <Reveal className="relative w-full max-w-md">
                    <div className="glass-strong p-8 sm:p-10">
                        <div className="mb-8 flex flex-col items-center text-center">
                            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
                                <IconKey className="h-7 w-7" />
                            </div>
                            <h1 className="mt-5 text-2xl font-bold text-white">Defina sua senha</h1>
                            <p className="mt-1 text-sm text-slate-400">
                                Por segurança, crie uma nova senha para continuar.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-5">
                            <div>
                                <label className="label" htmlFor="password">Nova senha</label>
                                <input
                                    id="password"
                                    type="password"
                                    className="input"
                                    value={data.password}
                                    autoFocus
                                    autoComplete="new-password"
                                    placeholder="Mínimo 8 caracteres"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <p className="mt-1.5 text-sm text-red-400">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="label" htmlFor="password_confirmation">Confirmar senha</label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    className="input"
                                    value={data.password_confirmation}
                                    autoComplete="new-password"
                                    placeholder="Repita a senha"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                />
                            </div>

                            <button type="submit" disabled={processing} className="btn-primary w-full py-3 text-base">
                                {processing ? 'Salvando…' : 'Salvar e continuar'}
                            </button>
                        </form>
                    </div>
                </Reveal>
            </div>
        </>
    );
}
