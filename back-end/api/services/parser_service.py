import re
from typing import List
from api.models.schedule import CourseItem

class ParserService:
    # Pattern 1: Handles tab/space separated copies directly from IRAS web tables
    TABBED_PATTERN = re.compile(
        r'(?P<code>[A-Z]{2,5}\d{3}[A-Z]*)'
        r'[\t\s]+'
        r'(?P<name>.+?)'
        r'[\t\s]+'
        r'(?P<sec>\d{1,2})'
        r'[\t\s]+'
        r'(?P<room>[A-Za-z0-9_]+)'
        r'[\t\s]+'
        r'(?P<days>[A-Za-z,]{1,7}):'
        r'(?P<start_time>\d{2}:\d{2})-'
        r'(?P<end_time>\d{2}:\d{2})'
    )

    # Pattern 2: Fallback for condensed raw text with no spaces/tabs
    CONDENSED_PATTERN = re.compile(
        r'(?P<code>[A-Z]{2,5}\d{3}[A-Z]*)'
        r'(?P<name>[^:]+)'
        r'(?P<sec>\d{1,2})'
        r'(?P<room>[A-Z][A-Za-z0-9_]*)'
        r'(?P<days>[A-Za-z,]{1,7}):'
        r'(?P<start_time>\d{2}:\d{2})-'
        r'(?P<end_time>\d{2}:\d{2})'
    )

    @classmethod
    def parse_raw_text(cls, raw_text: str) -> List[CourseItem]:
        # Strip common table headers if present
        cleaned_text = raw_text
        headers = ["Code", "Name", "Sec", "Room", "Time", "Attendance*", "Attendance %", "Grade"]
        for header in headers:
            cleaned_text = cleaned_text.replace(header, "")
        cleaned_text = cleaned_text.strip()

        # Try tab/space separated match first, then fallback to condensed match
        matches = list(cls.TABBED_PATTERN.finditer(cleaned_text))
        if not matches:
            matches = list(cls.CONDENSED_PATTERN.finditer(cleaned_text))

        courses: List[CourseItem] = []
        for match in matches:
            data = match.groupdict()
            courses.append(
                CourseItem(
                    id=data['code'].strip(),
                    name=data['name'].strip(),
                    section=data['sec'].strip(),
                    room=data['room'].strip(),
                    days=data['days'].strip(),
                    time=f"{data['start_time']} - {data['end_time']}"
                )
            )

        return courses