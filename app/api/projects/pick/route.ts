import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function GET() {
  // Fetch all projects
  const { data: projects, error } = await supabase.from("projects").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!projects || projects.length === 0) {
    return NextResponse.json({ message: "No projects found" }, { status: 404 });
  }

  // Simple random pick
  const picked = projects[Math.floor(Math.random() * projects.length)];

  return NextResponse.json(picked);
}
