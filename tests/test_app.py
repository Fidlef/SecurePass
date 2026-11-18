from app import create_app


def test_home_page_loads():
    client = create_app({"TESTING": True}).test_client()
    response = client.get("/")
    assert response.status_code == 200
    assert b"SecurePass" in response.data
    assert b"Zero uploads" in response.data


def test_health_endpoint():
    client = create_app({"TESTING": True}).test_client()
    response = client.get("/health")
    assert response.status_code == 200
    assert response.get_json() == {"status": "ok"}


def test_security_and_privacy_headers():
    client = create_app({"TESTING": True}).test_client()
    response = client.get("/")
    policy = response.headers["Content-Security-Policy"]
    assert "connect-src 'none'" in policy
    assert "frame-ancestors 'none'" in policy
    assert response.headers["Cache-Control"] == "no-store, max-age=0"
    assert response.headers["Referrer-Policy"] == "no-referrer"
    assert response.headers["X-Content-Type-Options"] == "nosniff"


def test_passwords_cannot_be_posted_to_server():
    client = create_app({"TESTING": True}).test_client()
    response = client.post("/", data={"password": "synthetic-secret"})
    assert response.status_code == 405
    assert b"synthetic-secret" not in response.data
