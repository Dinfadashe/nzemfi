import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/client';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const LOCKOUT_THRESHOLDS = [
  { attempts: 5,  minutes: 15 },
  { attempts: 8,  minutes: 60 },
  { attempts: 10, minutes: 1440 }, // 24 hours
];

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Find user by email
    const { data: user } = await supabase
      .from('users')
      .select('id, failed_login_attempts, account_locked_until, kyc_status')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (user) {
      // 2. Check lockout
      if (user.account_locked_until) {
        const lockUntil = new Date(user.account_locked_until);
        if (lockUntil > new Date()) {
          const minutesLeft = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
          return NextResponse.json(
            { error: `Account locked. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.` },
            { status: 423 }
          );
        }
      }
    }

    // 3. Attempt Supabase auth login
    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
        },
      }
    );

    const { data: authData, error: authErr } = await authClient.auth.signInWithPassword({ email, password });

    if (authErr || !authData.user) {
      // Increment failed attempts
      if (user) {
        const newAttempts = (user.failed_login_attempts || 0) + 1;
        const lockout = LOCKOUT_THRESHOLDS.slice().reverse().find(t => newAttempts >= t.attempts);

        const lockedUntil = lockout
          ? new Date(Date.now() + lockout.minutes * 60 * 1000).toISOString()
          : null;

        await supabase.from('users').update({
          failed_login_attempts: newAttempts,
          ...(lockedUntil ? { account_locked_until: lockedUntil } : {}),
        }).eq('id', user.id);

        if (lockout) {
          return NextResponse.json(
            { error: `Too many failed attempts. Account locked for ${lockout.minutes} minutes.` },
            { status: 423 }
          );
        }
      }
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 4. Successful login — reset failed attempts
    await supabase.from('users').update({
      failed_login_attempts: 0,
      account_locked_until: null,
    }).eq('id', authData.user.id);

    // 5. Return user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    return NextResponse.json({ success: true, user: profile });
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
