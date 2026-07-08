from supabase import create_client

url = "https://yvrkylhdfrnubijczuoi.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cmt5bGhkZnJudWJpamN6dW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0ODk4NDIsImV4cCI6MjA5OTA2NTg0Mn0.0CcH3gdpN8DqJT9SePEVzkne8i1NohJ9ioYVG1KTAM4"

client = create_client(url, key)
client.postgrest.headers["Authorization"] = "Bearer dummy_jwt_token"
if client.postgrest.session:
    client.postgrest.session.headers["Authorization"] = "Bearer dummy_jwt_token"
    print("Authorization header value:", dict(client.postgrest.session.headers).get("authorization"))
