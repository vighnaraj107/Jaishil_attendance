import os
import json
import base64
import time

from anthropic import Anthropic, InternalServerError
from dotenv import load_dotenv

load_dotenv()

client = Anthropic(api_key=os.getenv("CLAUDE_API_KEY") or os.getenv("ANTHROPIC_API_KEY"))

# ── Known contractor names ─────────────────────────────────────────────────────
# Claude is instructed to match against this list so it never invents new names.
VALID_CONTRACTORS = [
    "Shri Shyam",
    "Ayush",
    "Shri Laxmi",
    "Ansh",
    "Shri Radha",
    "Jaishil Sulphur and Chemical Industries"
]


def extract_attendance_from_image(image_path):

    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    # Build the contractor list for the prompt
    contractor_list = "\n".join(f"  - {c}" for c in VALID_CONTRACTORS)

    prompt = f"""
You are an attendance extraction AI for a factory.

Read this handwritten attendance sheet image carefully.

KNOWN CONTRACTOR NAMES — you MUST use one of these exactly:
{contractor_list}

Even if the handwriting is messy or unclear, pick the closest matching name
from the list above. Do NOT invent or return any other contractor name.

Extract ALL employee attendance rows and return ONLY a valid JSON array.

Format:
[
  {{
    "contractor": "<one of the known names above>",
    "shift": "DAY or NIGHT",
    "date": "YYYY-MM-DD",
    "employee_name": "<as written>",
    "in_time": "HH:MM",
    "out_time": "HH:MM"
  }}
]

RULES:
- "contractor" must exactly match one of the known names listed above.
- "shift" is DAY or NIGHT only.
- "date" must be YYYY-MM-DD. If year is missing, infer from context.
- "in_time" and "out_time" in 24-hour HH:MM format.
- If a value is truly unreadable, use empty string "".
- Return ONLY the JSON array — no explanation, no markdown fences.
"""

    max_retries = 3

    for attempt in range(max_retries):

        try:

            message = client.messages.create(
                model="claude-sonnet-4-5-20250929",
                max_tokens=4000,
                temperature=0,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": image_data
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            )
            break

        except InternalServerError:
            print(f"\nClaude API failed. Retry {attempt+1}/{max_retries}...\n")
            time.sleep(5)

    else:
        raise Exception("Claude API failed after multiple retries.")

    # Clean response
    response_text = message.content[0].text.strip()
    response_text = response_text.replace("```json", "").replace("```", "")

    start = response_text.find("[")
    end = response_text.rfind("]") + 1
    json_text = response_text[start:end]

    print("\nCLAUDE RESPONSE:\n")
    print(json_text)

    data = json.loads(json_text)
    print(f"\nTOTAL ROWS EXTRACTED: {len(data)}\n")

    return data
