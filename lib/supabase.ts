import { createBrowserClient } from '@supabase/ssr';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug environment variables - only log once on initial load
if (typeof window !== 'undefined' && !(window as any).__SUPABASE_LOGGED__) {
  console.log('Supabase Environment Check:', {
    url: supabaseUrl ? 'Loaded' : 'Missing',
    key: supabaseAnonKey ? 'Loaded' : 'Missing',
    nodeEnv: process.env.NODE_ENV,
  });
  (window as any).__SUPABASE_LOGGED__ = true;
}

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `Missing required Supabase environment variables:
  - NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'set' : 'missing'}
  - NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'set' : 'missing'}

  Please ensure these are set in your .env.local file and restart the development server.`;

  console.error('Supabase Configuration Error:', errorMsg);

  throw new Error('Missing required Supabase environment variables');
}

// Function to get the correct URL for authentication redirects
export const getRedirectUrl = (): string => {
  // Check if it's browser environment
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    // Ensure SSL is used
    const protocol = window.location.protocol;
    return `${protocol}//${host}/auth/callback`;
  }

  // Server-side: use environment variables
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (siteUrl) {
    const url = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    return `${url}/auth/callback`;
  }

  // Fallback for local development (Next.js default port)
  return 'http://localhost:3000/auth/callback';
};

// createBrowserClient is already a singleton and uses cookies via document.cookie automatically
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Development mode check
export const isDevelopment = process.env.NODE_ENV === 'development';

// Helper function for handling auth redirects in components
export const handleAuthRedirect = (customPath?: string) => {
  const baseUrl = getRedirectUrl();
  const redirectPath = customPath || '';

  // If custom path starts with '/', remove the trailing slash from baseUrl
  return customPath?.startsWith('/')
    ? `${baseUrl.slice(0, -1)}${redirectPath}`
    : `${baseUrl}${redirectPath}`;
};

// Test connection only when needed
export const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase connection test failed:', error);
    } else {
      console.log('Supabase connection successful!');
    }
  } catch (err) {
    console.error('Supabase connection test error:', err);
  }
};
