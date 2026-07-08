from supabase import create_client, Client
from app.config import settings

supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_ANON_KEY or "dummy_key"

# Base client for unauthenticated/system actions
supabase_client: Client = create_client(supabase_url, supabase_key)

def get_supabase_client(token: str = None) -> Client:
    """
    Returns a thread-safe Supabase client instance.
    If a user token is provided, configures it to run database queries authenticated as the user.
    """
    client = create_client(supabase_url, supabase_key)
    if token:
        # Override headers in both headers dictionary and the active httpx session
        client.postgrest.headers["Authorization"] = f"Bearer {token}"
        if client.postgrest.session:
            client.postgrest.session.headers["Authorization"] = f"Bearer {token}"
    return client

def verify_token(token: str) -> dict:
    """
    Verifies the JWT token by calling Supabase's auth.get_user endpoint.
    Returns the user data dict if valid, raises ValueError if invalid.
    """
    if not token:
        raise ValueError("Missing authentication token")
    try:
        # Use a scoped client with the token for verification
        client = get_supabase_client(token)
        response = client.auth.get_user(token)
        if response and response.user:
            return {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata
            }
        raise ValueError("Invalid user token")
    except Exception as e:
        raise ValueError(f"Token verification failed: {str(e)}")
