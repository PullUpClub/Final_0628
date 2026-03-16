import { createServerClient } from '@supabase/ssr';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Creates a Supabase client for use in pages/api/ route handlers.
 * Uses cookie-based auth via req/res objects.
 */
export function createApiClient(req: NextApiRequest, res: NextApiResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Convert req.cookies object to the array format Supabase expects
          return Object.entries(req.cookies).map(([name, value]) => ({
            name,
            value: value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Build cookie string with options
            const parts = [`${name}=${value}`];
            if (options?.path) parts.push(`Path=${options.path}`);
            if (options?.maxAge) parts.push(`Max-Age=${options.maxAge}`);
            if (options?.domain) parts.push(`Domain=${options.domain}`);
            if (options?.secure) parts.push('Secure');
            if (options?.httpOnly) parts.push('HttpOnly');
            if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);

            // Append to existing Set-Cookie headers
            const existing = res.getHeader('Set-Cookie');
            const cookies = Array.isArray(existing)
              ? existing
              : existing
                ? [String(existing)]
                : [];
            cookies.push(parts.join('; '));
            res.setHeader('Set-Cookie', cookies);
          });
        },
      },
    }
  );
}
