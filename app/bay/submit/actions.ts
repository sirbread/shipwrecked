"use server";

import { fetchHackatimeProjects } from "@/lib/hackatime";
import { HackatimeProject } from "@/types/hackatime";
import { z } from "zod";
import { createProjectAirtable, deleteProjectAirtable } from "@/app/api/projects/route";

const schema = z.object({
  // Project Details
  "Project Name": z.string().min(4, {
    message: "Project Name must contain at least 4 characters.",
  }),
  "Code URL": z.string().url({
    message: "The Code URL must be a valid URL",
  }),
  "Playable URL": z.string().url({
    message: "The Demo URL must be a valid URL",
  }),
  Description: z.string().optional(),
  "Hackatime Projects": z.array(z.string()),

  // Personal Details
  "Slack Id": z.string().nonempty(),

  "First Name": z.string().nonempty({
    message: "First Name cannot be empty",
  }),
  "Last Name": z.string().nonempty({
    message: "Last Name cannot be empty",
  }),
  Email: z.string().email({
    message: "Email must be a valid email",
  }),
  "Github Username": z.string().nonempty({
    message: "Github Username cannot be empty",
  }),
  Birthday: z.string().date("Birthday must be a valid date"),

  // Address Details
  "Address (Line 1)": z.string().nonempty({
    message: "Address cannot be empty",
  }),
  "Address (Line 2)": z.string().optional(),
  City: z.string().nonempty({
    message: "City cannot be empty",
  }),
  "State / Province": z.string().optional(),
  "ZIP / Postal Code": z.string().nonempty({
    message: "Field cannot be empty",
  }),
  Country: z.string().nonempty({
    message: "Country cannot be empty",
  }),

  // Feedback
  "How did you hear about this?": z.string().optional(),
  "What are we doing well?": z.string().optional(),
  "How can we improve?": z.string().optional(),
});

const projectSchema = z.object({
  // Project Details
  name: z.string().min(4, {
    message: "Project Name must contain at least 4 characters.",
  }),
  codeUrl: z.string().url({
    message: "The Code URL must be a valid URL",
  }),
  playableUrl: z.string().url({
    message: "The Demo URL must be a valid URL",
  }),
  description: z.string().optional(),
  hackatime: z.string()
})

export async function createProject(state: FormSave, payload: FormData): Promise<FormSave> {
  const data: any = {};
  payload.entries().forEach(([key, value]) => data[key] = value);

  const validated = await projectSchema.safeParseAsync(data);
  if (!validated.success) {
    console.log(validated.error);
    console.log(validated.error.flatten().fieldErrors)
    const errors = validated.error.flatten().fieldErrors;
    return {
      errors,
      data: undefined
    }
  }

  const result = await createProjectAirtable(data);
  return {
    errors: undefined,
    data: result as any
  }
}

export async function deleteProject(airtableProjectId: string) {
  try {
    return await deleteProject(airtableProjectId);
  } catch (err) {
    return err;
  }
}

type Data = Record<string, FormDataEntryValue | FormDataEntryValue[]>;

export type EntryData = Record<string, string | number | HackatimeProject[] | string[]>;

export type FormSave = {
  errors: Record<string, Array<string>> | undefined,
  data: EntryData | undefined
};

export async function save(state: FormSave, payload: FormData): Promise<FormSave> {
  const keys = Object.keys(schema.shape);

  const data: Data = {};
  keys.forEach((k: string) => (data[k] = payload.get(k) as string));
  data["Hackatime Projects"] = payload.getAll("Hackatime Projects");

  const validated = await schema.safeParseAsync(data);

  console.log(validated.error);

  if (!validated.success) {
    const errors = validated.error.flatten().fieldErrors;

    return {
      errors: errors,
      data: undefined
    };
  }

  const hackatime = await fetchHackatimeProjects(validated.data["Slack Id"]);
  const projects = hackatime.filter((v) =>
    validated.data["Hackatime Projects"].includes(v.name),
  );

  const totalSeconds = projects.reduce((prev, curr) => {
    return { ...prev, total_seconds: prev.total_seconds + curr.total_seconds };
  });
  const totalHours = Math.round(totalSeconds.total_seconds / 3600);

  const newEntry: EntryData = { ...validated.data };
  newEntry["Hackatime Projects"] = projects;
  newEntry["Total Hours Spent"] = totalHours;

  return {
    errors: undefined,
    data: newEntry
  };
}
