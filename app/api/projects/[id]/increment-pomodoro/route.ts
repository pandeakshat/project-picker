import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  // Await the async params object
  const { id } = await context.params;

  const projectId = parseInt(id, 10);

  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid project id" }, { status: 400 });
  }

  // Fetch current pomodoro count
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("pomodoro_count")
    .eq("id", projectId)
    .single();

  if (fetchError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Increment pomodoro count by 1
  const { error: updateError } = await supabase
    .from("projects")
    .update({ pomodoro_count: project.pomodoro_count + 1 })
    .eq("id", projectId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Pomodoro count incremented" });
}
