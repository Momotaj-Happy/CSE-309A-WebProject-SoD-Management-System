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
  // Sanitize: Replace carriage returns and clean up tabs/newlines safely
  const sanitizedText = rawText
    .replace(/\r/g, '')             // Remove carriage returns
    .replace(/[\x00-\x09\x0B-\x1F\x7F]/g, ' '); // Strip non-printable control characters except \n

  const response = await fetch(`${API_URL}/parse`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json' 
    },
    // JSON.stringify automatically escapes newlines (\n) and tabs (\t) into valid JSON
    body: JSON.stringify({ raw_text: sanitizedText }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to parse text');
  }

  return response.json();
}