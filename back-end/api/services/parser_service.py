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

    mapped_days = []
    for char in clean_days:
        if char in IRAS_DAY_MAP:
            mapped_days.append(IRAS_DAY_MAP[char])
        elif char.isalpha():
            mapped_days.append(char)

    return ", ".join(mapped_days) if mapped_days else clean_days


class ParserService:
    # Primary line-level pattern matching both tabbed and space-separated table rows
    LINE_PATTERN = re.compile(
        r'^\s*(?P<code>[A-Z]{2,5}\d{3}[A-Z]*)'
        r'[\t\s]+(?P<name>.+?)'
        r'[\t\s]+(?P<sec>\d{1,2}[A-Za-z]*)'
        r'[\t\s]+(?P<room>[A-Za-z0-9_]+)'
        r'[\t\s]+(?P<days>[A-Za-z,]{1,7})\s*:\s*'
        r'(?P<start_time>\d{1,2}:\d{2})\s*-\s*(?P<end_time>\d{1,2}:\d{2})',
        re.MULTILINE
    )

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
        r'(?P<start_time>\d{1,2}:\d{2})-'
        r'(?P<end_time>\d{1,2}:\d{2})'
    )

    CONDENSED_PATTERN = re.compile(
        r'(?P<code>[A-Z]{2,5}\d{3}[A-Z]*)'
        r'(?P<name>[^:]+)'
        r'(?P<sec>\d{1,2})'
        r'(?P<room>[A-Z][A-Za-z0-9_]*)'
        r'(?P<days>[A-Za-z,]{1,7}):'
        r'(?P<start_time>\d{1,2}:\d{2})-'
        r'(?P<end_time>\d{1,2}:\d{2})'
    )

    @classmethod
    def parse_raw_text(cls, raw_text: str) -> List[CourseItem]:
        cleaned_text = raw_text.replace('\r', '')
        headers = ["Code", "Name", "Sec", "Room", "Time", "Attendance*", "Attendance %", "Grade"]
        for header in headers:
            cleaned_text = cleaned_text.replace(header, "")

        courses: List[CourseItem] = []

        # Strategy 1: Multi-line pattern matching (handles tabbed & space-separated rows)
        line_matches = list(cls.LINE_PATTERN.finditer(cleaned_text))
        for match in line_matches:
            data = match.groupdict()
            s_time = data['start_time'].zfill(5)
            e_time = data['end_time'].zfill(5)
            courses.append(
                CourseItem(
                    id=data['code'].strip(),
                    name=data['name'].strip(),
                    section=data['sec'].strip(),
                    room=data['room'].strip(),
                    days=normalize_days(data['days'].strip()),
                    time=f"{s_time} - {e_time}"
                )
            )

        # Strategy 2: Tab-separated line split fallback if strategy 1 yielded no matches
        if not courses:
            lines = [line.strip() for line in cleaned_text.split('\n') if line.strip()]
            for line in lines:
                parts = [p.strip() for p in line.split('\t') if p.strip()]
                if parts and re.match(r'^[A-Z]{2,5}\d{3}[A-Z]*$', parts[0]):
                    if len(parts) >= 5:
                        code = parts[0]
                        name = parts[1]
                        sec = parts[2]
                        room = parts[3]
                        time_raw = parts[4]
                        if ':' in time_raw:
                            days_raw, time_range = time_raw.split(':', 1)
                        else:
                            days_raw, time_range = 'MON', time_raw

                        courses.append(
                            CourseItem(
                                id=code,
                                name=name,
                                section=sec,
                                room=room,
                                days=normalize_days(days_raw),
                                time=time_range.replace('-', ' - ').replace('  ', ' ')
                            )
                        )

        # Strategy 3: Tabbed/Condensed regex fallback
        if not courses:
            matches = list(cls.TABBED_PATTERN.finditer(cleaned_text))
            if not matches:
                matches = list(cls.CONDENSED_PATTERN.finditer(cleaned_text))

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