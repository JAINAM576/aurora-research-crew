from typing import List, Optional, Any, Iterator, AsyncIterator
from langchain_openai import ChatOpenAI
from langchain_core.outputs import ChatResult
from langchain_core.messages import BaseMessage
from langchain_core.callbacks import CallbackManagerForLLMRun, AsyncCallbackManagerForLLMRun
from app.config import settings

# Custom subclass of ChatOpenAI to bypass CrewAI's validation error:
# "RunnableWithFallbacks" object has no field "callbacks"
# Handles fallback for standard, async, streaming, and async-streaming LLM requests.
class FallbackChatOpenAI(ChatOpenAI):
    fallback_models: List[Any] = []

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        try:
            return super()._generate(messages, stop, run_manager, **kwargs)
        except Exception as e:
            if self.fallback_models:
                print(f"[WARNING] Primary model failed with: {str(e)}. Trying fallbacks...")
                for fallback in self.fallback_models:
                    try:
                        return fallback._generate(messages, stop, run_manager, **kwargs)
                    except Exception as fe:
                        print(f"[WARNING] Fallback model failed: {str(fe)}")
            raise e

    async def _agenerate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[AsyncCallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        try:
            return await super()._agenerate(messages, stop, run_manager, **kwargs)
        except Exception as e:
            if self.fallback_models:
                print(f"[WARNING] Primary model async failed with: {str(e)}. Trying fallbacks...")
                for fallback in self.fallback_models:
                    try:
                        return await fallback._agenerate(messages, stop, run_manager, **kwargs)
                    except Exception as fe:
                        print(f"[WARNING] Fallback model async failed: {str(fe)}")
            raise e

    def _stream(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[Any]:
        try:
            yield from super()._stream(messages, stop, run_manager, **kwargs)
        except Exception as e:
            if self.fallback_models:
                print(f"[WARNING] Primary model stream failed with: {str(e)}. Trying fallbacks...")
                for fallback in self.fallback_models:
                    try:
                        yield from fallback._stream(messages, stop, run_manager, **kwargs)
                        return
                    except Exception as fe:
                        print(f"[WARNING] Fallback model stream failed: {str(fe)}")
            raise e

    async def _astream(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[AsyncCallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> AsyncIterator[Any]:
        try:
            async for chunk in super()._astream(messages, stop, run_manager, **kwargs):
                yield chunk
        except Exception as e:
            if self.fallback_models:
                print(f"[WARNING] Primary model async stream failed with: {str(e)}. Trying fallbacks...")
                for fallback in self.fallback_models:
                    try:
                        async for chunk in fallback._astream(messages, stop, run_manager, **kwargs):
                            yield chunk
                        return
                    except Exception as fe:
                        print(f"[WARNING] Fallback model async stream failed: {str(fe)}")
            raise e

def get_llm(provider: str, model: str, reasoning: bool = False):
    """
    Creates a LangChain ChatOpenAI instance based on the provider and model name.
    Used for compatibility with CrewAI v0.36.0.
    """
    configs = {
        "groq": {
            "base_url": "https://api.groq.com/openai/v1",
            "api_key": settings.GROQ_API_KEY,
        },
        "openrouter": {
            "base_url": "https://openrouter.ai/api/v1",
            "api_key": settings.OPENROUTER_API_KEY,
        },
        "nim": {
            "base_url": "https://integrate.api.nvidia.com/v1",
            "api_key": settings.NIM_API_KEY,
        }
    }

    if provider not in configs:
        raise ValueError(f"Unknown provider: {provider}")

    config = configs[provider]
    api_key = config["api_key"] or "dummy_key"

    extra_kwargs = {}
    extra_body = {}
    
    if provider == "openrouter" and reasoning:
        # Enable native OpenRouter reasoning/chain-of-thought support
        extra_body["reasoning"] = {"enabled": True}
    elif provider == "nim":
        # Enable NVIDIA NIM parameters as per documentation
        extra_body["chat_template_kwargs"] = {"thinking": False}

    if extra_body:
        # Pydantic v2 requires extra_body to be passed explicitly, not in model_kwargs
        extra_kwargs["extra_body"] = extra_body

    return ChatOpenAI(
        model=model,
        openai_api_key=api_key,
        openai_api_base=config["base_url"],
        **extra_kwargs
    )

# Standard agent assignments with automatic fallback configurations.
def get_research_llm():
    primary = get_llm("groq", "llama-3.3-70b-versatile")
    
    # Wrap in FallbackChatOpenAI
    wrapped = FallbackChatOpenAI(
        model=primary.model_name,
        openai_api_key=primary.openai_api_key,
        openai_api_base=primary.openai_api_base
    )
    
    if settings.OPENROUTER_API_KEY:
        wrapped.fallback_models.append(get_llm("openrouter", "meta-llama/llama-3.3-70b-instruct:free"))
    return wrapped

def get_factcheck_llm():
    primary = get_llm("openrouter", "nvidia/nemotron-3-ultra-550b-a55b:free", reasoning=True)
    
    # Pass extra_body explicitly to avoid Pydantic v2 validation error
    wrapped = FallbackChatOpenAI(
        model="nvidia/nemotron-3-ultra-550b-a55b:free",
        openai_api_key=primary.openai_api_key,
        openai_api_base=primary.openai_api_base,
        extra_body={"reasoning": {"enabled": True}}
    )
    
    if settings.GROQ_API_KEY:
        wrapped.fallback_models.append(get_llm("groq", "llama-3.3-70b-versatile"))
    return wrapped

def get_writer_llm():
    primary = get_llm("nim", "deepseek-ai/deepseek-v4-pro")
    
    # Pass extra_body explicitly to avoid Pydantic v2 validation error
    wrapped = FallbackChatOpenAI(
        model="deepseek-ai/deepseek-v4-pro",
        openai_api_key=primary.openai_api_key,
        openai_api_base=primary.openai_api_base,
        extra_body={"chat_template_kwargs": {"thinking": False}}
    )
    
    if settings.OPENROUTER_API_KEY:
        wrapped.fallback_models.append(get_llm("openrouter", "meta-llama/llama-3.1-70b-instruct:free"))
    if settings.GROQ_API_KEY:
        wrapped.fallback_models.append(get_llm("groq", "llama-3.3-70b-versatile"))
    return wrapped

def get_editor_llm():
    primary = get_llm("groq", "llama-3.3-70b-versatile")
    
    wrapped = FallbackChatOpenAI(
        model=primary.model_name,
        openai_api_key=primary.openai_api_key,
        openai_api_base=primary.openai_api_base
    )
    
    if settings.OPENROUTER_API_KEY:
        wrapped.fallback_models.append(get_llm("openrouter", "meta-llama/llama-3.3-70b-instruct:free"))
    return wrapped
