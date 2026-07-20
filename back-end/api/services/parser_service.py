import re
from typing import List
from models.schedule import CourseItem

class ParserService:
    # Extracts ID, Name, Section, Room, Days, Start Time, and End Time
    PATTERN = re.compile(
        r'(?P<code>[A-Z]{2,5}\d{3}[A-Z]*)'
        r'(?P<name>.+?)'
        r'(?P<sec>\d{1,2})'
        r'(?P<room>[A-Za-z0-9_]+?)'
        r'(?P<days>[A-Z]{1,3}):'
        r'(?P<start_time>\d{2}:\d{2})-'
        r'(?P<end_time>\d{2}:\d{2})'
    )

    @classmethod
    def parse_raw_text(cls, raw_text: str) -> List[CourseItem]:
        header = "CodeNameSecRoomTimeAttendance*Attendance %Grade"
        cleaned_text = raw_text.replace(header, "").strip()

        courses: List[CourseItem] = []
        for match in cls.PATTERN.finditer(cleaned_text):
            data = match.groupdict()
            room = data['room'].strip()
            days = data['days'].strip()

            # Handle edge case where room prefix merges into days string
            if days.startswith('L') and len(days) > 1:
                room += 'L'
                days = days[1:]

            courses.append(
                CourseItem(
                    id=data['code'].strip(),
                    name=data['name'].strip(),
                    section=data['sec'].strip(),
                    room=room,
                    days=days,
                    time=f"{data['start_time']} - {data['end_time']}"
                )
            )

        return courses