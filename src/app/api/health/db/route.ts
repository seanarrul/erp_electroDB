import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';
import { checkDatabaseHealth } from '@/lib/db-health';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: login required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get('fresh') === '1';

    const health = await checkDatabaseHealth(forceFresh);
    return NextResponse.json(health);
  } catch {
    return NextResponse.json(
      {
        connected: false,
        status: 'disconnected',
        message: 'The server could not reach the database.',
      },
      { status: 500 }
    );
  }
}
