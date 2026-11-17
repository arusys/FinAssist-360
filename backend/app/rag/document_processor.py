import re
from typing import List, Dict, Any

class DocumentProcessor:
    @staticmethod
    def extract_text(file_bytes: bytes, filename: str) -> str:
        """Extract text from TXT, Markdown, or clean text formats."""
        try:
            # Handle plain text / markdown / utf-8
            text = file_bytes.decode("utf-8", errors="ignore")
            return text
        except Exception as e:
            return f"Error extracting text from {filename}: {str(e)}"

    @staticmethod
    def sanitize_text(text: str) -> str:
        """Sanitize text to prevent prompt injection and remove invalid characters."""
        # Strip potential prompt injection triggers
        text = re.sub(r"(?i)ignore (all )?previous instructions", "[REDACTED_INSTRUCTION]", text)
        text = re.sub(r"(?i)system prompt:", "[REDACTED_PROMPT]", text)
        return text

    @staticmethod
    def chunk_document(text: str, chunk_size: int = 500, chunk_overlap: int = 80) -> List[Dict[str, Any]]:
        """Split document into coherent chunks preserving section headings where possible."""
        sanitized = DocumentProcessor.sanitize_text(text)
        
        # Split by section headers or double newlines
        paragraphs = re.split(r'\n{2,}', sanitized)
        chunks = []
        current_chunk = ""
        current_section = "General"
        
        for p in paragraphs:
            p_strip = p.strip()
            if not p_strip:
                continue
            
            # Detect section header
            if p_strip.startswith("#") or re.match(r'^\d+\.\s+[A-Z\s]+', p_strip):
                current_section = p_strip.split('\n')[0].replace('#', '').strip()

            if len(current_chunk) + len(p_strip) <= chunk_size:
                current_chunk += ("\n\n" if current_chunk else "") + p_strip
            else:
                if current_chunk:
                    chunks.append({
                        "content": current_chunk.strip(),
                        "section_name": current_section
                    })
                # If a single paragraph is longer than chunk_size, split by sentences
                if len(p_strip) > chunk_size:
                    sentences = re.split(r'(?<=[.!?])\s+', p_strip)
                    sub_chunk = ""
                    for s in sentences:
                        if len(sub_chunk) + len(s) <= chunk_size:
                            sub_chunk += (" " if sub_chunk else "") + s
                        else:
                            if sub_chunk:
                                chunks.append({
                                    "content": sub_chunk.strip(),
                                    "section_name": current_section
                                })
                            sub_chunk = s
                    if sub_chunk:
                        current_chunk = sub_chunk
                else:
                    current_chunk = p_strip

        if current_chunk:
            chunks.append({
                "content": current_chunk.strip(),
                "section_name": current_section
            })

        return chunks
