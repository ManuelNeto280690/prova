<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Blocks any non-admin from reaching the admin area.
 * A logged-in student hitting an admin route gets a hard 403 —
 * never a silent pass-through.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            abort(403, 'Acesso restrito à administração.');
        }

        return $next($request);
    }
}
