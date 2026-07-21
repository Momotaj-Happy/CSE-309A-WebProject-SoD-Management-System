export interface Course {
  id: string;
  name: string;
  section: string;
  room: string;
  days: string;
  time: string;
}

export interface ScheduleResponse {
  success: boolean;
  courses: Course[];
}

const API_URL = 'http://localhost:8000/api/schedule';

export async function parseScheduleApi(rawText: string): Promise<ScheduleResponse> {
  const response = await fetch(`${API_URL}/parse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text: rawText }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to parse text');
  }

  return response.json();
}