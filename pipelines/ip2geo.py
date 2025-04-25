import os
import sys
import requests
import itertools
import math

from dotenv import load_dotenv

load_dotenv()

# -----
# Load Environment
# -----


AIRTABLE_API = os.environ.get("AIRTABLE_API_KEY")
AIRTABLE_BASE = os.environ.get("AIRTABLE_BASE_ID")
IPINFO_API = os.environ.get("IPINFO_API_TOKEN")

if not AIRTABLE_API or not AIRTABLE_BASE:
    sys.stderr.write("AIRTABLE_API_KEY or AIRTABLE_BASE_ID missing! exitting...\n")
    sys.exit(-1)

if not IPINFO_API:
    sys.stderr.write("IPINFO_API_TOKEN missing! exitting...\n")
    sys.exit(-2)


# -----
# Requests Setup
# -----


class AirtableAuth(requests.auth.AuthBase):
    def __call__(self, r):
        r.headers["Authorization"] = f"Bearer {AIRTABLE_API}"
        return r


class IpinfoAuth(requests.auth.AuthBase):
    def __call__(self, r):
        r.headers["Authorization"] = f"Bearer {IPINFO_API}"
        return r


# -----
# Fetch Airtable Records
# -----


query = {
    "fields[]": "IP Address",
    "filterByFormula": "AND({IP Address} != 'Unknown', {Country} = BLANK())",
    "maxRecords": 100,
}

print("Fetching Queued Airtable Records")
data = requests.get(
    f"https://api.airtable.com/v0/{AIRTABLE_BASE}/RSVPs",
    params=query,
    auth=AirtableAuth(),
).json()

print(f'Found {len(data["records"])} Records!')
if len(data["records"]) == 0:
    print("No Records left to process, exitting...")
    sys.exit(0)

# -----
# Parse Records
# -----


# Parses an airtable records to (AIRTABLE_ID, IP)
def parse_record(record):
    id = record["id"]
    ip = record["fields"]["IP Address"]
    return (id, ip)


# Parses all of the records
print("Parsing Records...")
records = map(parse_record, data["records"])

# -----
# Processing
# -----


# Get Geo Location
def get_geoloc(ip):
    print(f"Fetching Geolocation for {ip}")
    return requests.get(
        f"https://ipinfo.io/{ip}/country", auth=IpinfoAuth()
    ).text.strip()


# -----
# Update Records
# -----


def update(record):
    (id, ip) = record
    country = get_geoloc(ip)
    return {"id": id, "fields": {"Country": country}}


print("Updating Records...")
records = list(map(update, records))

# -----
# Patch Airbase Table
# -----

# Airtable Patch works in groups of 10
batch_n = math.ceil(len(records) / 10)
for i, batch in enumerate(itertools.batched(records, 10)):
    print(f"Patching Airtable Base with Batch {i + 1}/{batch_n}")
    data = requests.patch(
        f"https://api.airtable.com/v0/{AIRTABLE_BASE}/RSVPs",
        json={"records": list(batch)},
        auth=AirtableAuth(),
    )
