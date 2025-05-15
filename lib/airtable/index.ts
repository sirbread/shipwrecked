import { airtableApi } from "../airtable";
export const { 
  getRecordCount,
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord
} = airtableApi;
