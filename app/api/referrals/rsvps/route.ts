import { NextResponse } from 'next/server';
import { airtableApi } from '@/lib/airtable';
const { getRecords } = airtableApi;

export async function GET() {
  try {
    const records = await getRecords("RSVPs");
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return NextResponse.json({ error: 'Failed to fetch RSVPs' }, { status: 500 });
  }
} 