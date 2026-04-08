import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY", "")
print(f"Key starts with: {api_key[:12]}...")
genai.configure(api_key=api_key)

print("\nAvailable models supporting generateContent:")
for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(" -", m.name)
