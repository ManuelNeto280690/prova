<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Forces a first-access password change before the user can do anything else.
 */
class EnsurePasswordChanged
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password) {
            $allowed = ['first-access', 'first-access.update', 'logout'];

            if (! in_array($request->route()?->getName(), $allowed, true)) {
                return redirect()->route('first-access');
            }
        }

        return $next($request);
    }
}
