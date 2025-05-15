
// export * from process.env.NODE_ENV === "development" ? "@/__mocks__/airtable" : "@/lib/airtable";
if (process.env.NODE_ENV === "development") {
  module.exports = require("@/__mocks__/airtable");
} else {
  module.exports = require("@/lib/airtable");
}
