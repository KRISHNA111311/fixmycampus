# Location System
FixMyCampus uses a verified-only room directory. We deliberately do not
generate rooms like B4-103 just because B4-101 and B4-102 exist.

## Data model
- buildings { code, name, floors, active }
- rooms { buildingCode, roomNumber, displayName, floor, department, departmentCode, roomType, roomName, verified, source, active, coordinates? }
- campusPlaces { name, kind, icon, verified, active }

## Kinds
ROOM | BUILDING | FACILITY | HOSTEL | OUTDOOR | MAP_POINT

## Adding rooms
Edit scripts/seed.ts with verified entries, then `npm run seed`.
Never invent room numbers. Unverified rooms must have verified:false.