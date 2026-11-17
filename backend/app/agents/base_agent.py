import time
from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseAgent(ABC):
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role

    def execute(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Wraps step execution with timing and error safety."""
        start_time = time.perf_counter()
        try:
            output = self.run(state)
            status = "SUCCESS"
        except Exception as e:
            output = {"error": str(e), "agent_failure": True}
            status = "FAILED"
        duration_ms = (time.perf_counter() - start_time) * 1000

        return {
            "agent_name": self.name,
            "agent_role": self.role,
            "status": status,
            "output_data": output,
            "execution_time_ms": round(duration_ms, 2)
        }

    @abstractmethod
    def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Specific agent logic to be implemented by subclasses."""
        pass
