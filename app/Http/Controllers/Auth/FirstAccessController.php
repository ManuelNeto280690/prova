<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class FirstAccessController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('Auth/FirstAccess');
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()->min(8)],
        ]);

        $request->user()->update([
            'password' => $validated['password'],
            'must_change_password' => false,
        ]);

        return redirect()->route('dashboard')->with('flash', 'Senha definida com sucesso.');
    }
}
