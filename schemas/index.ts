import { z } from "zod";
export const emailDomain = process.env.ALLOWED_EMAIL_DOMAIN ?? "gvpce.ac.in";
export const RequestOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email().refine(
    v => v.endsWith(`@${emailDomain}`),
    { message: `Only @${emailDomain} email addresses are allowed.` }
  )
});
export const VerifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().regex(/^\d{6}$/),
  name: z.string().trim().min(2).max(60).optional()
});
export const SeverityZ = z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]);
export const CategoryZ = z.enum(["Electrical","Plumbing","Cleanliness","Infrastructure","Furniture","Network","HVAC","Safety","Hostel","Laboratory","Washroom","Other"]);
export const LocationZ = z.object({
  kind: z.enum(["ROOM","BUILDING","FACILITY","HOSTEL","OUTDOOR","MAP_POINT"]),
  buildingCode: z.string().optional(), buildingName: z.string().optional(),
  roomNumber: z.string().optional(), displayName: z.string().min(1),
  department: z.string().optional(), roomType: z.string().optional(),
  placeName: z.string().optional(),
  coordinates: z.object({ type: z.literal("Point"), coordinates: z.tuple([z.number(), z.number()]) }).optional(),
  source: z.enum(["USER_SELECTED_ROOM","USER_SELECTED_PLACE","GPS","GPS + USER_CONFIRMATION","MAP_POINT"])
});
export const CreateIssueSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(3).max(1200),
  originalDescription: z.string().trim().max(1200).optional(),
  category: CategoryZ,
  subcategory: z.string().max(60).optional(),
  severity: SeverityZ,
  affectedUsers: z.number().int().min(1).max(5000).default(1),
  location: LocationZ,
  images: z.array(z.string().url()).max(4).default([]),
  ai: z.object({
    object: z.string().optional(), problem: z.string().optional(),
    categorySuggestion: z.string().optional(), severitySuggestion: SeverityZ.optional(),
    safetyRisk: z.boolean().optional(), confidence: z.number().min(0).max(1).optional(),
    generatedDescription: z.string().optional(), uncertainties: z.array(z.string()).optional()
  }).optional()
});