import { NextResponse } from 'next/server';
import { getRecordCount } from '@/lib/airtable';

export async function GET() {
  try {
    const count = await getRecordCount("RSVPs");
    // console.log("received RSVP count from airtalbe", count);
    return NextResponse.json({ count });
  } catch (error) {
    // console.error('Error fetching Airtable stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 