export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IssueStatus = "OPEN" | "TRIAGED" | "ASSIGNED" | "IN_PROGRESS" | "FIXED" | "VERIFIED" | "CLOSED" | "REOPENED";
export type Role = "STUDENT" | "STAFF" | "ADMIN";
export type LocationKind = "ROOM" | "BUILDING" | "FACILITY" | "HOSTEL" | "OUTDOOR" | "MAP_POINT";
export interface SessionUser { _id: string; email: string; name?: string; role: Role; departmentCode?: string; createdAt: string; }
export interface AiAnalysis { object: string; problem: string; category: string; subcategory?: string; severitySuggestion: Severity; safetyRisk: boolean; departmentSuggestion?: string; description: string; visibleObservation?: string; possibleConsequence?: string; confidence: number; uncertainties: string[]; }
export interface NormalizedLocation {
  kind: LocationKind; buildingCode?: string; buildingName?: string; roomNumber?: string;
  displayName: string; department?: string; roomType?: string; placeName?: string;
  coordinates?: { type: "Point"; coordinates: [number, number] };
  source: "USER_SELECTED_ROOM" | "USER_SELECTED_PLACE" | "GPS" | "GPS + USER_CONFIRMATION" | "MAP_POINT";
}