import asyncio
import json
from typing import Dict, AsyncGenerator, Any

class EventBus:
    def __init__(self):
        # Maps request ID / topic to a set of asyncio.Queue
        self._queues: Dict[str, asyncio.Queue] = {}

    def register(self, task_id: str) -> asyncio.Queue:
        if task_id not in self._queues:
            self._queues[task_id] = asyncio.Queue()
        return self._queues[task_id]

    def unregister(self, task_id: str):
        if task_id in self._queues:
            del self._queues[task_id]

    async def publish(self, task_id: str, event: Dict[str, Any]):
        if task_id in self._queues:
            await self._queues[task_id].put(event)

    async def listen(self, task_id: str) -> AsyncGenerator[Dict[str, Any], None]:
        queue = self.register(task_id)
        try:
            while True:
                event = await queue.get()
                if event == {"type": "complete"}:
                    break
                yield event
                queue.task_done()
        finally:
            self.unregister(task_id)

event_bus = EventBus()
