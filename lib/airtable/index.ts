const isMock = process.env.NODE_ENV === 'development';

const {
  getRecordCount,
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord
} = isMock 
  ? require('./airtable.mock')
  : require('./airtable');

// Re-export individual functions for direct import
export {
  getRecordCount,
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord
};
