import { NextResponse } from 'next/server';
import { getCount } from '../store';

export async function GET() {
  try {
    console.log('Count endpoint called');
    const count = await getCount();
    console.log('Count endpoint returning:', count);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching cached stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 