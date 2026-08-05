import re
from typing import List
from api.models.schedule import CourseItem

IRAS_DAY_MAP = {
    'S': 'SUN',
    'M': 'MON',
    'T': 'TUE',
    'W': 'WED',
    'R': 'THU',
    'F': 'FRI',
    'A': 'SAT'
}


def normalize_days(raw_days: str) -> str:
    """
    Converts IRAS day codes (e.g., 'ST', 'MW', 'AR', 'S', 'W') 
    into standard day names (e.g., 'SUN, TUE', 'MON, WED', 'SAT, THU').
    """
    clean_days = raw_days.strip().upper()
    
    # If already formatted with standard day names (e.g., MON, TUE)
    for std_day in ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']:
        if std_day in clean_days:
            return clean_days

    # Otherwise, map single-letter codes
    mapped_days = []
    for char in clean_days:
        if char in IRAS_DAY_MAP:
            mapped_days.append(IRAS_DAY_MAP[char])
        elif char.isalpha():
            mapped_days.append(char)

    return ", ".join(mapped_days) if mapped_days else clean_days


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
        cleaned_text = raw_text
        headers = ["Code", "Name", "Sec", "Room", "Time", "Attendance*", "Attendance %", "Grade"]
        for header in headers:
            cleaned_text = cleaned_text.replace(header, "")
        cleaned_text = cleaned_text.strip()

        matches = list(cls.TABBED_PATTERN.finditer(cleaned_text))
        if not matches:
            matches = list(cls.CONDENSED_PATTERN.finditer(cleaned_text))

        courses: List[CourseItem] = []
        for match in matches:
            data = match.groupdict()
            raw_d = data['days'].strip()
            norm_d = normalize_days(raw_d)

            courses.append(
                CourseItem(
                    id=data['code'].strip(),
                    name=data['name'].strip(),
                    section=data['sec'].strip(),
                    room=data['room'].strip(),
                    days=norm_d,
                    time=f"{data['start_time']} - {data['end_time']}"
                )
            )

        return courses